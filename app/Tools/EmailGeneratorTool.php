<?php

namespace App\Tools;

use App\Tools\Contracts\ToolInterface;

class EmailGeneratorTool implements ToolInterface
{
    public function execute(array $input): array
    {
        $topic = $input['topic'] ?? 'general email';
        
        return [
            'success' => true,
            'tool' => 'Email Generator',
            'output' => "Generated professional email about: {$topic}",
            'timestamp' => now()
        ];
    }

    public function getName(): string
    {
        return 'Email Generator';
    }

    public function getDescription(): string
    {
        return 'Generate professional emails using AI';
    }
}
