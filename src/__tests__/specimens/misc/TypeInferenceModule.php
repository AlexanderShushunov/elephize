<?php
/* NOTICE: Generated file; Do not edit by hand */
namespace VK\Elephize;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class TypeInferenceModule extends CJSModule {
    /**
     * @var TypeInferenceModule $_mod
     */
    private static $_mod;
    public static function getInstance(): TypeInferenceModule {
        if (!self::$_mod) {
            self::$_mod = new TypeInferenceModule();
        }
        return self::$_mod;
    }

    /**
     * @var string|float $tyia
     */
    public $tyia;
    /**
     * @var float $tyib
     */
    public $tyib;
    /**
     * @var float|string $tyic
     */
    public $tyic;
    /**
     * @var int $tyid
     */
    public $tyid;
    /**
     * @var string|int $tyie
     */
    public $tyie;
    /**
     * @var int $tyif
     */
    public $tyif;
    /**
     * @var float $tyig
     */
    public $tyig;
    /**
     * @var mixed $tyih
     */
    public $tyih;
    /**
     * @var mixed $tyij
     */
    public $tyij;
    /**
     * @var mixed $tyik
     */
    public $tyik;
    /**
     * @var mixed $tyii
     */
    public $tyii;
    /**
     * @param mixed ...$args
     * @return string
     */
    public function classNames(...$args) {
        $result = [];
        foreach ($args as $item) {
            if (!$item) {
                break;
            }
            switch (Stdlib::typeof($item)) {
                case "string":
                    array_push($result, $item);
                    break;
                case "object":
                    foreach (array_keys($item) as $key) {
                        if ($item[+$key]) {
                            array_push($result, $key);
                        }
                    }
                    break;
                default:
                    array_push($result, "" . $item);
            }
        }
        return implode(" ", $result);
    }

    private function __construct() {
        $this->tyia = "123";
        $this->tyib = 1;
        $this->tyic = "2";
        $this->tyid = 3;
        $this->tyie = "32";
        $this->tyif = (int) "123";
        $this->tyig = (int) "123" + 456;
        $this->tyih = ["123", 123];
        $this->tyij = ["123", 123];
        $this->tyik = ["123", 123];
        $this->tyii = 123;
        $this->tyii = "123";
        \VK\Elephize\Builtins\Console::log(
            $this->tyia,
            $this->tyib,
            $this->tyic,
            $this->tyid,
            $this->tyie,
            $this->tyif,
            $this->tyig,
            $this->tyih,
            $this->tyii,
            $this->tyij,
            $this->tyik
        );
    }
}
