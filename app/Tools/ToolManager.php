<?php

namespace App\Tools;

use App\Tools\Contracts\ToolInterface;

class ToolManager
{
    private $tools = [];

    public function __construct()
    {
        $this->registerTools();
    }

    private function registerTools()
    {
        $this->tools['Email Generator'] = new EmailGeneratorTool();
        $this->tools['Document Processor'] = new DocumentProcessorTool();
        $this->tools['Data Analyzer'] = new DataAnalyzerTool();
        $this->tools['Document Converter'] = new DocumentConverterTool(); // ADD THIS LINE
    }

    public function getTool(string $name): ?ToolInterface
    {
        return $this->tools[$name] ?? null;
    }

    public function listTools(): array
    {
        return array_map(function (ToolInterface $tool) {
            return [
                'name' => $tool->getName(),
                'description' => $tool->getDescription()
            ];
        }, $this->tools);
    }

    public function executeTool(string $name, array $input): array
    {
        $tool = $this->getTool($name);
        if (!$tool) {
            return ['error' => "Tool '$name' not found"];
        }
        return $tool->execute($input);
    }
}
