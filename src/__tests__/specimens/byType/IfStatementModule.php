<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize\src\__tests__\specimens\byType;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class IfStatementModule extends CJSModule {
    /**
     * @var IfStatementModule $_mod
     */
    private static $_mod;
    public static function getInstance(): IfStatementModule {
        if (!self::$_mod) {
            self::$_mod = new IfStatementModule();
        }
        return self::$_mod;
    }

    /**
     * @var float $aa
     */
    public $aa;
    /**
     * @var float $ba
     */
    public $ba;
    /**
     * @var array $obj1
     */
    public $obj1;

    private function __construct() {
        $this->aa = 1;
        $this->ba = 2;
        if ($this->aa == $this->ba) {
            \VK\Elephize\Builtins\Console::log("123");
        } elseif ($this->aa >= $this->ba) {
            \VK\Elephize\Builtins\Console::log("321");
        } else {
            \VK\Elephize\Builtins\Console::log("222");
        }
        if ($this->aa <= $this->ba) {
            \VK\Elephize\Builtins\Console::log("123321");
        }
        $this->obj1 = [
            "a" => 1,
            "b" => 2,
        ];
        if (isset($this->obj1["a"])) {
            \VK\Elephize\Builtins\Console::log("kek");
        }
    }
}
