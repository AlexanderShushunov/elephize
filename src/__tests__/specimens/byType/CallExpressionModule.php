<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class CallExpressionModule extends CJSModule {
    /**
     * @var CallExpressionModule $_mod
     */
    private static $_mod;
    public static function getInstance(): CallExpressionModule {
        if (!self::$_mod) {
            self::$_mod = new CallExpressionModule();
        }
        return self::$_mod;
    }

    /**
     * @var array $c
     */
    public $c;

    private function __construct() {
        $this->c = \VK\Elephize\Builtins\document::getElementById("test");
        \VK\Elephize\Builtins\Console::log($this->c);
    }
}
