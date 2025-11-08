<?php

namespace App\Tools\Contracts;

interface ToolInterface
{
    public function execute(array $input): array;
    
    public function getName(): string;
    
    public function getDescription(): string;
}
