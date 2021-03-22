<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize\src\__tests__\specimens\stringMethods;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class StrIncludesModule extends CJSModule {
    /**
     * @var StrIncludesModule $_mod
     */
    private static $_mod;
    public static function getInstance(): StrIncludesModule {
        if (!self::$_mod) {
            self::$_mod = new StrIncludesModule();
        }
        return self::$_mod;
    }

    /**
     * @var string $ainc
     */
    public $ainc;
    /**
     * @var boolean $binc
     */
    public $binc;
    /**
     * @var boolean $cinc
     */
    public $cinc;

    private function __construct() {
        $this->ainc = "12345";
        $this->binc = strpos($this->ainc, "2") !== false;
        $this->cinc = strpos($this->ainc, "2", 2) !== false;
        \VK\Elephize\Builtins\Console::log($this->binc, $this->cinc);
    }
}
