<?php

namespace App\Tools;

use App\Tools\Contracts\ToolInterface;

class DocumentProcessorTool implements ToolInterface
{
    public function execute(array $input): array
    {
        $filename = $input['filename'] ?? 'document';
        
        return [
            'success' => true,
            'tool' => 'Document Processor',
            'output' => "Processed document: {$filename}",
            'timestamp' => now()
        ];
    }

    public function getName(): string
    {
        return 'Document Processor';
    }

    public function getDescription(): string
    {
        return 'Process and extract data from documents';
    }
}
