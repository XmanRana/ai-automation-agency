<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class DocumentController extends Controller
{
    private $cloudConvertKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYzgyNThkMzdlNzAzZTY1ODY4NzMwNmRmMWM0ZWVjZTBjNmEyZDQ0ZmE4YjQ1Y2FjNDcyOTUyMzgwZDNlNzU1Y2EzZTkyY2I4MzQwYWYwNjMiLCJpYXQiOjE3NjI2ODYyMjQuMzAxMzc4LCJuYmYiOjE3NjI2ODYyMjQuMzAxMzc5LCJleHAiOjQ5MTgzNTk4MjQuMjk0MTk1LCJzdWIiOiI3MzQyMDk2NiIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ0YXNrLnJlYWQiLCJ1c2VyLndyaXRlIiwicHJlc2V0LnJlYWQiLCJwcmVzZXQud3JpdGUiLCJ3ZWJob29rLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay53cml0ZSJdfQ.kj_-MLpsOBXVNWXBGbI046k042IHOjCjSQ0tsymmykpYCUs8u-mULBqUAcR18QrHL003LjRdRYKNOtsDC6L4Haq2_0-YSvlrmF4URBGXpmKt_VNKSOjZ0mZDx21ssCHshq5cljPggguiFBKMa4xfinKuCeG_o--mjky858OrqYj5M9pF0HTWyRaVZwOZAMOAO5defHHHDLoOnczyZNl-LuUqb15-NdshxDgDHP7dLB9eiLQi7ARmMSWMa1CTC4CYDTN_TXeDzTFkRpRGJF-V4GapKU-acTfQAWe-YvSpysmM2XFRFi9wOIUCtCSsHbox9DmhAtRKZ6ZTHOsQSbMoRQs-E_fOAmPqmSv3FefANiyMA7-72-h2LBBthP27gmYiuE45dcLSAgdP5ReK6EkMxgWX8an-mxhYhYR3mkOsYWH3umUDFB5J9Z1Os5V3pXQXqb9giaNAUfBVVJkF5xsQzuaXjLJuRPg4e9iW-shvwSlmYn27T7N_79pdOO0gxhctiYcKeyVuPdqZI9-vIcRp1ggNC6TiHjXVwMxWnWCwvlcUIJ66zdjQb4EYVg4DnCeIqYwJST8QmbVwqGj_DPN31LRYcDzOAIBYVraUl-baqc3Whlb7F1ZUi_zfN6QdoXq5kRyUbdY7WZnf9qoU1E7ehQOBa7qmMw-B_m6hR9vJ-Lw';

    public function upload(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,png,gif|max:50000']);

        try {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = Storage::disk('public')->putFileAs('documents', $file, $filename);

            return response()->json([
                'success' => true,
                'filename' => $filename,
                'path' => '/storage/' . $path,
                'size' => filesize(storage_path('app/public/' . $path)),
                'message' => 'File uploaded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function convert(Request $request)
    {
        $request->validate(['filename' => 'required|string', 'task' => 'required|string']);

        $filename = $request->filename;
        $task = strtolower(trim($request->task));
        $filePath = storage_path('app/public/documents/' . $filename);

        if (!file_exists($filePath)) {
            return response()->json(['success' => false, 'error' => 'File not found'], 404);
        }

        try {
            $result = match($task) {
                'word to pdf', 'docx to pdf' => $this->convertFile($filePath, $filename, 'pdf'),
                'excel to pdf', 'xlsx to pdf' => $this->convertFile($filePath, $filename, 'pdf'),
                'image to pdf', 'jpg to pdf', 'png to pdf' => $this->convertFile($filePath, $filename, 'pdf'),
                'pdf to word', 'pdf to docx' => $this->convertFile($filePath, $filename, 'docx'),
                default => ['success' => false, 'error' => 'Try: word to pdf, excel to pdf, image to pdf, pdf to word']
            };

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function mergePdfs(Request $request)
    {
        $request->validate(['files' => 'required|array|min:2', 'files.*' => 'string']);

        try {
            $files = $request->input('files');
            $docDir = storage_path('app/public/documents');
            
            foreach ($files as $file) {
                $fullPath = $docDir . '/' . $file;
                if (!file_exists($fullPath)) {
                    return response()->json(['success' => false, 'error' => "File not found: $file"], 404);
                }
            }

            $tasks = [
                'import-1' => [
                    'operation' => 'import/url',
                    'url' => url('/storage/documents/' . $files[0])
                ]
            ];

            for ($i = 1; $i < count($files); $i++) {
                $tasks["import-" . ($i + 1)] = [
                    'operation' => 'import/url',
                    'url' => url('/storage/documents/' . $files[$i])
                ];
            }

            $mergeInputs = [];
            for ($i = 0; $i < count($files); $i++) {
                $mergeInputs[] = 'import-' . ($i + 1);
            }

            $tasks['merge-1'] = [
                'operation' => 'merge',
                'input' => $mergeInputs
            ];

            $tasks['export-1'] = [
                'operation' => 'export/url',
                'input' => 'merge-1'
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->cloudConvertKey,
            ])->post('https://api.cloudconvert.com/v2/jobs', ['tasks' => $tasks]);

            if (!$response->successful()) {
                throw new \Exception('CloudConvert error: ' . $response->body());
            }

            $job = $response->json();
            $jobId = $job['data']['id'];

            $maxWait = 60;
            for ($waited = 0; $waited < $maxWait; $waited++) {
                sleep(1);
                $statusResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->cloudConvertKey,
                ])->get('https://api.cloudconvert.com/v2/jobs/' . $jobId);

                $status = $statusResponse->json();
                
                if ($status['data']['status'] === 'finished') {
                    $exportTask = null;
                    foreach ($status['data']['tasks'] as $task) {
                        if ($task['operation'] === 'export/url' && $task['status'] === 'finished') {
                            $exportTask = $task;
                            break;
                        }
                    }
                    
                    if ($exportTask && isset($exportTask['result']['files'][0]['url'])) {
                        $fileUrl = $exportTask['result']['files'][0]['url'];
                        $convertedFile = Http::get($fileUrl);
                        
                        $outputDir = storage_path('app/public/documents');
                        $out = 'merged_' . time() . '.pdf';
                        $outputPath = $outputDir . '/' . $out;
                        
                        file_put_contents($outputPath, $convertedFile->body());
                        
                        return [
                            'success' => true,
                            'message' => '✅ PDFs merged successfully!',
                            'output_file' => $out,
                            'download_url' => url('/storage/documents/' . $out)
                        ];
                    }
                } elseif ($status['data']['status'] === 'failed') {
                    throw new \Exception('Merge failed');
                }
            }

            throw new \Exception('Merge timeout');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    private function convertFile($filePath, $filename, $outputFormat)
    {
        try {
            $fileContent = file_get_contents($filePath);
            $base64 = base64_encode($fileContent);
            $inputExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

            $inputFormatMap = [
                'docx' => 'docx',
                'doc' => 'docx',
                'xlsx' => 'xlsx',
                'xls' => 'xlsx',
                'jpg' => 'jpg',
                'jpeg' => 'jpg',
                'png' => 'png',
                'gif' => 'gif',
                'pdf' => 'pdf'
            ];

            $inputFormat = $inputFormatMap[$inputExt] ?? $inputExt;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->cloudConvertKey,
            ])->post('https://api.cloudconvert.com/v2/jobs', [
                'tasks' => [
                    'import-1' => [
                        'operation' => 'import/base64',
                        'file' => $base64,
                        'filename' => $filename
                    ],
                    'convert-1' => [
                        'operation' => 'convert',
                        'input' => 'import-1',
                        'output_format' => $outputFormat
                    ],
                    'export-1' => [
                        'operation' => 'export/url',
                        'input' => 'convert-1'
                    ]
                ]
            ]);

            if (!$response->successful()) {
                throw new \Exception('CloudConvert error: ' . $response->body());
            }

            $job = $response->json();
            $jobId = $job['data']['id'];

            $maxWait = 60;
            for ($waited = 0; $waited < $maxWait; $waited++) {
                sleep(1);
                $statusResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->cloudConvertKey,
                ])->get('https://api.cloudconvert.com/v2/jobs/' . $jobId);

                $status = $statusResponse->json();
                
                if ($status['data']['status'] === 'finished') {
                    $exportTask = null;
                    foreach ($status['data']['tasks'] as $task) {
                        if ($task['operation'] === 'export/url' && $task['status'] === 'finished') {
                            $exportTask = $task;
                            break;
                        }
                    }
                    
                    if ($exportTask && isset($exportTask['result']['files'][0]['url'])) {
                        $fileUrl = $exportTask['result']['files'][0]['url'];
                        $convertedFile = Http::get($fileUrl);
                        
                        $outputDir = storage_path('app/public/documents');
                        $out = str_replace('.' . $inputExt, '.' . $outputFormat, basename($filename));
                        $outputPath = $outputDir . '/' . $out;
                        
                        file_put_contents($outputPath, $convertedFile->body());
                        
                        return [
                            'success' => true,
                            'message' => '✅ Conversion successful!',
                            'output_file' => $out,
                            'download_url' => url('/storage/documents/' . $out),
                            'original' => $filename
                        ];
                    }
                } elseif ($status['data']['status'] === 'failed') {
                    throw new \Exception('Conversion failed');
                }
            }

            throw new \Exception('Conversion timeout');
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
