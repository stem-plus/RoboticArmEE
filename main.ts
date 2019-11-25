/* The MIT License (MIT)

Copyright (c) 2017 Riven

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */


//% color="#ff7300" weight=10 icon="\uf110"
namespace RoboticArm {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const LED0_ON_L = 0x06
    const PRESCALE = 0xFE

    let initialized = false


    export enum Servos {
        C0 = 0x00,
        C1 = 0x01,
        C2 = 0x02,
        C3 = 0x03,
        C4 = 0x04,
        C5 = 0x05,
        C6 = 0x06,
        C7 = 0x07,
        C8 = 0x08,
        C9 = 0x09,
        C10 = 0x0A,
        C11 = 0x0B,
        C12 = 0x0C,
        C13 = 0x0D,
        C14 = 0x0E,
        C15 = 0x0F,
    }


    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    //% blockId=Servo_Driver block="Set the angle of the servo motor connecting to the pin |%index| to |%degree|"
    //% weight=100
    //% blockGap=50
    //% degree.min=0 degree.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=8
    export function Servo(index: Servos, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index, 0, value)
    }

    //% blockId=vsangle block="Calculate the angle of the servo motor on the vertical axis of minimal value \n |%vsminangle| and maximal value |%vsmaxangle| according to the reading |%vsreading|"
    //% weight=100
    //% blockGap=50
    //% vsmaxangle.min=0 vsmaxangle.max=180
    //% vsminangle.min=0 vsminangle.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=8
    export function VerticalShaft(vsreading: number, vsminangle: number, vsmaxangle: number): number {
        return pins.map(
            vsreading,
            0,
            1020,
            vsminangle,
            vsmaxangle
        )
    }

    //% blockId=hzangle block="Calculate the angle of the servo motor on the horizontal axis according to the reading |%hzreading| and the angle of the servo motor on the vertical axis |%vsservoangle| with angle A of the minimal value |%hzminangle| and the maximal value |%hzmaxangle|"
    //% weight=100
    //% blockGap=50
    //% hzmaxangle.min=0 hzsmaxangle.max=180
    //% hzminangle.min=0 hzminangle.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=8
    export function HorizontalShaft(hzreading: number, vsservoangle: number, hzminangle: number, hzmaxangle: number): number {
        return pins.map(hzreading,
            0,
            1020,
            hzminangle - vsservoangle + 90,
            hzmaxangle - vsservoangle + 90
        )

    }

    //% blockId=bsangle block="Calculate the angle of the base of minimal value |%bsminangle| and maximal value |%bsmaxangle| according to the reading |%bsreading|"
    //% weight=100
    //% blockGap=50
    //% bsmaxangle.min=0 bsmaxangle.max=180
    //% bsminangle.min=0 bsminangle.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=8
    export function BaseAngle(bsreading: number, bsminangle: number, bsmaxangle: number): number {
        return pins.map(
            bsreading,
            0,
            1020,
            bsminangle,
            bsmaxangle
        )
    }


}
