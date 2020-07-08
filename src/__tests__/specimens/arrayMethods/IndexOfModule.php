<?php
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class IndexOfModule extends CJSModule {
    /**
     * @var IndexOfModule $_mod
     */
    private static $_mod;
    public static function getInstance(): IndexOfModule {
        if (!self::$_mod) {
            self::$_mod = new IndexOfModule();
        }
        return self::$_mod;
    }

    public $aio;
    public $bio;
    public $cio;
    public $dio;
    public $fio;

    private function __construct() {
        $this->aio = [1, 2, 3];
        $this->bio = Stdlib::arrayIndexOf(2, $this->aio);
        $this->cio = Stdlib::arrayIndexOf(1, $this->aio, 1);
        $this->dio = Stdlib::arrayLastIndexOf(1, $this->aio);
        $this->fio = Stdlib::arrayLastIndexOf(1, $this->aio, 1);
        \VK\Elephize\Builtins\Console::log($this->bio, $this->cio, $this->dio, $this->fio);
    }
}
