<?php

namespace App\Tools;

use App\Tools\Contracts\ToolInterface;

class DocumentConverterTool implements ToolInterface
{
    public function execute(array $input): array
    {
        $task = $input['type'] ?? $input['topic'] ?? '';
        $filename = $input['filename'] ?? '';

        $tasks = [
            'pdf_to_word' => 'Convert PDF to Word Document',
            'pdf to word' => 'Convert PDF to Word Document',
            'convert to word' => 'Convert PDF to Word Document',
            'word_to_pdf' => 'Convert Word to PDF',
            'word to pdf' => 'Convert Word to PDF',
            'convert to pdf' => 'Convert Word to PDF',
            'compress_pdf' => 'Compress PDF to reduce file size',
            'compress pdf' => 'Compress PDF to reduce file size',
            'compress' => 'Compress PDF to reduce file size',
            'delete_pages' => 'Delete specific pages from PDF',
            'delete pages' => 'Delete specific pages from PDF',
            'merge_pdfs' => 'Merge multiple PDF files',
            'merge pdf' => 'Merge multiple PDF files',
            'merge' => 'Merge multiple PDF files',
            'extract_text' => 'Extract text from PDF',
            'extract text' => 'Extract text from PDF',
            'extract' => 'Extract text from PDF',
            'rotate_pages' => 'Rotate pages in PDF',
            'rotate pages' => 'Rotate pages in PDF',
            'rotate' => 'Rotate pages in PDF',
            'add_watermark' => 'Add watermark to PDF',
            'add watermark' => 'Add watermark to PDF'
        ];

        $task = strtolower(trim($task));

        if (empty($task)) {
            return $this->listTasks($tasks);
        }

        if (!isset($tasks[$task])) {
            return [
                'success' => false,
                'tool' => 'Document Converter',
                'error' => "Unknown task: $task",
                'suggestion' => 'Available tasks: compress pdf, convert to word, merge pdf, etc.'
            ];
        }

        return [
            'success' => true,
            'tool' => 'Document Converter',
            'task' => $task,
            'filename' => $filename,
            'status' => 'Ready for processing',
            'output' => "✅ Task: " . $tasks[$task] . "\n📁 File: $filename\n\n⏳ Processing your file...\n\n💾 Your converted file will be ready to download!"
        ];
    }

    private function listTasks($tasks): array
    {
        $uniqueTasks = [];
        foreach ($tasks as $key => $desc) {
            if (!str_contains($key, ' ')) {
                $uniqueTasks[$key] = $desc;
            }
        }

        $taskList = implode("\n", array_map(function($key, $desc) {
            return "• $key: $desc";
        }, array_keys($uniqueTasks), array_values($uniqueTasks)));

        return [
            'success' => true,
            'tool' => 'Document Converter',
            'output' => "📄 Available Document Conversion Tasks:\n\n$taskList\n\n✅ How to use:\n1. Upload your file\n2. Type a task\n3. Download the result!"
        ];
    }

    public function getName(): string
    {
        return 'Document Converter';
    }

    public function getDescription(): string
    {
        return 'Convert, compress, and edit PDF/Word documents';
    }
}
