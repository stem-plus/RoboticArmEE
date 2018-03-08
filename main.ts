/*
Copyright 2018 Jack Ho

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

let buf = pins.createBuffer(8)

enum MyEnum {
    //% block="001001.mp3"
    One = 1,
    //% block="002002.mp3"
    Two = 2,
    //% block="003003.mp3"
    Three = 3,
    //% block="004004.mp3"
    Four = 4,
     //% block="005005.mp3"
    Five = 5,
     //% block="006006.mp3"
    Six = 6,
    //% block="007007.mp3"
    Seven = 7,
    //% block="008008.mp3"
    Eight = 8

}

/**
 * Custom blocks
 */
//% weight=5 color=#2699BF icon="\uf110"
namespace MP3 {
    /**
     * TODO: describe your function here
     * @param RX connects to RX pin of the module
     * @param TX connects to TX pin of the module
     */
       //% blockId=mp3_init block="Initialise MP3 module |RX: %RX| TX: %TX"
    //% weight=89
    export function InitialiseMP3(RX: SerialPin, TX: SerialPin): void {
        // Add code here
        buf.setNumber(NumberFormat.UInt8LE, 0, 0x7e)
        buf.setNumber(NumberFormat.UInt8LE, 1, 0xff)
        buf.setNumber(NumberFormat.UInt8LE, 2, 0x06)
        buf.setNumber(NumberFormat.UInt8LE, 3, 0x09)
        buf.setNumber(NumberFormat.UInt8LE, 4, 0x01)
        buf.setNumber(NumberFormat.UInt8LE, 5, 0x00)
        buf.setNumber(NumberFormat.UInt8LE, 6, 0x02)
        buf.setNumber(NumberFormat.UInt8LE, 7, 0xef)
        serial.redirect(
            RX,
            TX,
            BaudRate.BaudRate9600
        )
        serial.writeBuffer(buf)

    }

    /**
     * TODO: Use the block to play a mp3 file in the folder 01/ in microSD card.
     * @param value describe value here, eg: 5
     */
        //% blockId=mp3_play block="Play MP3 file %RX| in folder /01"
    //% weight=89

    export function PlayMP3(value: MyEnum) {
        buf.setNumber(NumberFormat.UInt8LE, 0, 0x7e)
        buf.setNumber(NumberFormat.UInt8LE, 1, 0xff)
        buf.setNumber(NumberFormat.UInt8LE, 2, 0x06)
        buf.setNumber(NumberFormat.UInt8LE, 3, 0x0f)
        buf.setNumber(NumberFormat.UInt8LE, 4, 0x00)
        buf.setNumber(NumberFormat.UInt8LE, 5, 0x01)
        buf.setNumber(NumberFormat.UInt8LE, 6, value)
        buf.setNumber(NumberFormat.UInt8LE, 7, 0xef)
        serial.writeBuffer(buf)
    }
}

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
    basic.showString(serial.readLine())
})
