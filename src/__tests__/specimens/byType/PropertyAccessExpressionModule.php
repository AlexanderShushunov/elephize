<?php
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class PropertyAccessExpressionModule extends CJSModule {
    /**
     * @var PropertyAccessExpressionModule $_mod
     */
    private static $_mod;
    public static function getInstance(): PropertyAccessExpressionModule {
        if (!self::$_mod) {
            self::$_mod = new PropertyAccessExpressionModule();
        }
        return self::$_mod;
    }

    public $b1;
    public $d1;
    public $d2;
    public $d3;
    public $d4;

    private function __construct() {
        $this->b1 = [
            "a" => 1,
            "b" => 2,
        ];
        $this->d1 = $this->b1["a"];
        $this->d2 = $this->b1["b"];
        $this->d3 = [
            "a" => [
                "b" => [
                    "c" => 1,
                ],
            ],
        ];
        $this->d4 = (string) $this->d3["a"]["b"]["c"];
        \VK\Elephize\Builtins\Console::log($this->d1, $this->d2, $this->d4);
    }
}
