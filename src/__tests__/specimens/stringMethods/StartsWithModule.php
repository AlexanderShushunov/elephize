<?php
/* NOTICE: autogenerated file; Do not edit by hand */
namespace specimens\stringMethods;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class StartsWithModule extends CJSModule {
    /**
     * @var StartsWithModule $_mod
     */
    private static $_mod;
    public static function getInstance(): StartsWithModule {
        if (!self::$_mod) {
            self::$_mod = new StartsWithModule();
        }
        return self::$_mod;
    }

    /**
     * @var string $astw
     */
    public $astw;
    /**
     * @var bool $bstw
     */
    public $bstw;
    /**
     * @var bool $cstw
     */
    public $cstw;

    private function __construct() {
        $this->astw = "12345";
        $this->bstw = strpos($this->astw, "1") === 0;
        $this->cstw = strpos($this->astw, "2", 1) === 0;
        \VK\Elephize\Builtins\Console::log($this->bstw, $this->cstw);
    }
}
