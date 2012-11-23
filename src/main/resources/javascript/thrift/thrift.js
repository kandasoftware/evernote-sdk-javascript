/**
 * Copyright (c) 2012 Kanda Software. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */
var Thrift = {
    Type:{
        "STOP":0,
        "VOID":1,
        "BOOL":2,
        "BYTE":3,
        "I08":3,
        "DOUBLE":4,
        "I16":6,
        "I32":8,
        "I64":10,
        "STRING":11,
        "UTF7":11,
        "STRUCT":12,
        "MAP":13,
        "SET":14,
        "LIST":15,
        "UTF8":16,
        "UTF16":17
    },

    MessageType:{
        "CALL":1,
        "REPLY":2,
        "EXCEPTION":3
    }
};

Thrift.TException = {};
Thrift.TException.prototype = {
    initialize:function(message, code) {
        this.message = message;
        this.code = (code == null) ? 0 : code;
    }
};

Thrift.TApplicationExceptionType = {
    "UNKNOWN":0,
    "UNKNOWN_METHOD":1,
    "INVALID_MESSAGE_TYPE":2,
    "WRONG_METHOD_NAME":3,
    "BAD_SEQUENCE_ID":4,
    "MISSING_RESULT":5
};

Thrift.TApplicationException = function(message, code) {
    this.message = message;
    this.code = (code == null) ? 0 : code
};

Thrift.TApplicationException.prototype = {

    read:function(input) {

        var ftype;
        var fid;
        var ret = input.readStructBegin(fname);

        this.fname = ret.fname;

        while (1) {

            ret = input.readFieldBegin();

            if (ret.ftype == TType.STOP)
                break;

            var fid = ret.fid;

            switch (fid) {
                case 1:
                    if (ret.ftype == Type.STRING) {
                        ret = input.readString();
                        this.message = ret.value
                    } else {
                        ret = input.skip(ret.ftype)
                    }

                    break;
                case 2:
                    if (ret.ftype == Type.I32) {
                        ret = input.readI32();
                        this.code = ret.value
                    } else {
                        ret = input.skip(ret.ftype)
                    }
                    break;

                default:
                    ret = input.skip(ret.ftype);
                    break
            }

            input.readFieldEnd()

        }

        input.readStructEnd()

    },

    write:function(output) {
        var xfer = 0;

        output.writeStructBegin('TApplicationException');

        if (this.message) {
            output.writeFieldBegin('message', Type.STRING, 1);
            output.writeString(this.getMessage());
            output.writeFieldEnd()
        }

        if (this.code) {
            output.writeFieldBegin('type', Type.I32, 2);
            output.writeI32(this.code);
            output.writeFieldEnd();
        }

        output.writeFieldStop();
        output.writeStructEnd();

    },

    getCode:function() {
        return this.code;
    },

    getMessage:function() {
        return this.message;
    }
};


/**
 * If you do not specify a url then you must handle ajax on your own.
 * This is how to use js bindings in a async fashion.
 */


//TODO: REMOVE ALL CALLBACKS
Thrift.Transport = function(url) {
    this.url = url;
    this.wpos = 0;
    this.rpos = 0;

    this.send_buf = '';
    this.recv_buf = new Array();
};

Thrift.Transport.prototype = {

    //Gets the browser specific XmlHttpRequest Object
    getXmlHttpRequestObject:function() {

        try {
            return new XMLHttpRequest();
        } catch (e) {
            if (Eventnote && Eventnote.Logger) {
                Eventnote.Logger.error(e);
            }
        }
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            if (Eventnote && Eventnote.Logger) {
                Eventnote.Logger.error(e);
            }
        }
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            if (Eventnote && Eventnote.Logger) {
                Eventnote.Logger.error(e);
            }
        }

        throw "Your browser doesn't support the XmlHttpRequest object.  Try upgrading to Firefox."

    },

    flush:function(k) {
        if (this.url == undefined || this.url == '')
            return this.send_buf;

        var request = this.getXmlHttpRequestObject();

        if (request.overrideMimeType)
            request.overrideMimeType("text/plain; charset=x-user-defined");
        //used async=false
        request.open("POST", this.url, false);
        request.setRequestHeader("Content-Type", "application/x-thrift");

        request.sendAsBinary(this.getSendBuffer());
        this.setRecvBuffer(this.uint8Array(request.response));
        this.send_buf = '';
    },
    setRecvBuffer:function(buf) {
        this.recv_buf = buf;
        this.recv_buf_sz = this.recv_buf.length;
        this.wpos = this.recv_buf.length;
        this.rpos = 0
    },

    isOpen:function() {
        return true
    },

    open:function() {
    },

    close:function() {
    },

    read:function(len) {
        var avail = this.wpos - this.rpos;

        if (avail == 0)
            return '';

        var give = len;

        if (avail < len)
            give = avail;

        var ret = this.read_buf.substr(this.rpos, give);
        this.rpos += give;

        //clear buf when complete?
        return ret
    },

    readAll:function(off, len) {
        var buf = this.recv_buf.subarray(this.rpos, this.rpos + len);
        this.rpos = this.rpos + len;
        var string = '';
        for (var i = 0; i < buf.length; i++) {
            var s = buf[i].toString(16).toUpperCase();
            if (s.length == 1) {
                s = 0 + s;
            }
            string = string + s;
        }
        return buf;
    },

    write:function(buf) {
        this.send_buf = buf
    },

    getSendBuffer:function() {
        return this.send_buf
    },
    uint8Array:function(data) {
        var ords = new Array();
        for (var i = 0; i < data.length; i++) {
            ords.push(data.charCodeAt(i));

        }

        return new Uint8Array(ords);
    }
};


Thrift.Protocol = function(transport) {
    this.transport = transport
};

Thrift.Protocol.Type = {};
Thrift.Protocol.Type[ Thrift.Type.BOOL   ] = '"tf"';
Thrift.Protocol.Type[ Thrift.Type.BYTE   ] = '"i8"';
Thrift.Protocol.Type[ Thrift.Type.I16    ] = '"i16"';
Thrift.Protocol.Type[ Thrift.Type.I32    ] = '"i32"';
Thrift.Protocol.Type[ Thrift.Type.I64    ] = '"i64"';
Thrift.Protocol.Type[ Thrift.Type.DOUBLE ] = '"dbl"';
Thrift.Protocol.Type[ Thrift.Type.STRUCT ] = '"rec"';
Thrift.Protocol.Type[ Thrift.Type.STRING ] = '"str"';
Thrift.Protocol.Type[ Thrift.Type.MAP    ] = '"map"';
Thrift.Protocol.Type[ Thrift.Type.LIST   ] = '"lst"';
Thrift.Protocol.Type[ Thrift.Type.SET    ] = '"set"';


Thrift.Protocol.RType = {};
Thrift.Protocol.RType[ "tf" ] = Thrift.Type.BOOL;
Thrift.Protocol.RType[ "i8" ] = Thrift.Type.BYTE;
Thrift.Protocol.RType[ "i16"] = Thrift.Type.I16;
Thrift.Protocol.RType[ "i32"] = Thrift.Type.I32;
Thrift.Protocol.RType[ "i64"] = Thrift.Type.I64;
Thrift.Protocol.RType[ "dbl"] = Thrift.Type.DOUBLE;
Thrift.Protocol.RType[ "rec"] = Thrift.Type.STRUCT;
Thrift.Protocol.RType[ "str"] = Thrift.Type.STRING;
Thrift.Protocol.RType[ "map"] = Thrift.Type.MAP;
Thrift.Protocol.RType[ "lst"] = Thrift.Type.LIST;
Thrift.Protocol.RType[ "set"] = Thrift.Type.SET;

Thrift.Protocol.Version = 1;

Thrift.Protocol.prototype = {

    getTransport:function() {
        return this.transport
    },

    stringToHex:function(value) {
        return (value.charCodeAt(0) & 0xff).toString(16).toUpperCase();
    },
    byteToHex:function(value) {
        return value.toString(16).toUpperCase();
    },

    //Write functions
    writeMessageBegin:function(name, messageType, seqid) {
        this.ra = new Array();
        var version = 0x80010000 | messageType;
        this.writeI32(version);
        this.writeString(name);
        this.writeI32(seqid);
    },

    writeMessageEnd:function() {
        this.transport.write(this.ra);
    },


    writeStructBegin:function(name) {
    },

    writeStructEnd:function() {
    },

    writeFieldBegin:function(name, fieldType, fieldId) {
        this.writeByte(fieldType);
        this.writeI16(fieldId);

    },

    writeFieldEnd:function() {
    },

    writeFieldStop:function() {
        this.writeByte(Thrift.Type.STOP)
    },

    writeMapBegin:function(keyType, valType, size) {
        this.writeByte(keyType);
        this.writeByte(valType);
        this.writeI32(size);
    },

    writeMapEnd:function() {
    },

    writeListBegin:function(elemType, size) {
        this.writeByte(elemType);
        this.writeI32(size);
    },

    writeListEnd:function() {
    },

    writeSetBegin:function(elemType, size) {
        this.writeByte(elemType);
        this.writeI32(size);
    },

    writeSetEnd:function() {
    },

    writeBool:function(value) {
        this.ra.push(value ? 1 : 0);
    },

    writeByte:function(i8) {
        this.ra.push(this.byteToHex(i8))
    },

    writeI16:function(i16) {
        var i16out = new Array();
        i16out[0] = 0xff & i16 >> 8;
        i16out[1] = 0xff & i16;

        var result = Array.prototype.map.call(i16out, this.byteToHex);
        for (var i = 0; i < 2; i++) {
            this.ra.push(result[i]);
        }

    },

    writeI32:function(i32) {
        var i32out = new Array();
        i32out[0] = 0xff & i32 >> 24;
        i32out[1] = 0xff & i32 >> 16;
        i32out[2] = 0xff & i32 >> 8;
        i32out[3] = 0xff & i32;

        var result = Array.prototype.map.call(i32out, this.byteToHex);
        for (var i = 0; i < 4; i++) {
            this.ra.push(result[i]);
        }

    },

    shiftR:function(i64, bits) {
        var bitString = i64.toString(2);
        var i64out = "";
        for (var i = 0; i < bits; i++) {
            i64out = i64out + "0";
        }
        for (var j = 0; j < bitString.length - bits; j++) {
            i64out = i64out + bitString[j];
        }
        return parseInt(i64out, 2);
    },

    writeI64:function(i64) {
        var i64out = new Array();
        i64out[0] = 0xff & this.shiftR(i64, 56);
        i64out[1] = 0xff & this.shiftR(i64, 48);
        i64out[2] = 0xff & this.shiftR(i64, 40);
        i64out[3] = 0xff & this.shiftR(i64, 32);
        i64out[4] = 0xff & this.shiftR(i64, 24);
        i64out[5] = 0xff & this.shiftR(i64, 16);
        i64out[6] = 0xff & this.shiftR(i64, 8);
        i64out[7] = 0xff & this.shiftR(i64, 0);

        var result = Array.prototype.map.call(i64out, this.byteToHex);
        for (var i = 0; i < 8; i++) {
            this.ra.push(result[i]);
        }
    },

    writeDouble:function(dbl) {
        if (Eventnote && Eventnote.Logger) {
            Eventnote.Logger.error("Unsupported use of writeDouble.");
        }
    },

    writeString:function(str) {
        var result = Array.prototype.map.call(this.encode(str).split(""), this.stringToHex);
        this.writeI32(result.length);
        for (var i = 0; i < result.length; i++) {
            this.ra.push(result[i]);
        }
    },

    writeBinary:function(str) {
        if (Eventnote && Eventnote.Logger) {
            Eventnote.Logger.error("Unsupported use of writeBinary.");
        }
    },


    // Reading functions
    readMessageBegin:function() {
        var init = this.readI32();
        var size = init.value;
        var version = size & 0xffff0000;

        if (version != -2147418112) {
            throw "Wrong thrift protocol version: " + version
        }

        var r = {};
        r["fname"] = this.readString().value;
        r["mtype"] = size & 0x000000ff;
        r["rseqid"] = this.readI32().value;

        return r;
    },


    readMessageEnd:function() {
    },

    readStructBegin:function(name) {
        var r = {};
        r["fname"] = '';

        return r;
    },

    readStructEnd:function() {
    },

    readFieldBegin:function() {

        var ftype = this.readByte().value;
        var fid = ftype == Thrift.Type.STOP ? 0 : this.readI16().value;
        var r = {};
        r["fname"] = '';
        r["ftype"] = ftype;
        r["fid"] = fid;

        return r;
    },

    readFieldEnd:function() {
    },

    readMapBegin:function(keyType, valType, size) {
        console.log("map is not implemented!!!!!!!!!!!!!!");

        if (Eventnote && Eventnote.Logger) {
            Eventnote.Logger.error("Unsupported use of readMapBegin.");
        }

        var map = this.rstack.pop();

        var r = {};
        r["ktype"] = Thrift.Protocol.RType[map.shift()];
        r["vtype"] = Thrift.Protocol.RType[map.shift()];
        r["size"] = map.shift();


        this.rpos.push(this.rstack.length);
        this.rstack.push(map.shift());

        return r;
    },

    readMapEnd:function() {
        if (Eventnote && Eventnote.Logger) {
            Eventnote.Logger.error("Unsupported use of readMapEnd.");
        }

        this.readFieldEnd();
    },

    readListBegin:function(elemType, size) {
        var r = {};

        r["etype"] = this.readByte().value;
        r["size" ] = this.readI32().value;
        return r;
    },

    readListEnd:function() {
    },

    readSetBegin:function(elemType, size) {
        return this.readListBegin(elemType, size)
    },

    readSetEnd:function() {
        return this.readListEnd()
    },

    readBool:function() {
        var r = {};
        r["value"] = (this.readByte().value == 1);
        return r;
    },

    readByte:function() {

        var bin = new Array();
        bin = this.transport.readAll(0, 1);

        var r = {};
        r["value"] = bin[0];

        return r
    },

    readI16:function() {
        var i16rd = new Array();
        i16rd = this.transport.readAll(0, 2);

        var r = {};
        r["value"] = (i16rd[0] & 0xff) << 8 | i16rd[1] & 0xff;

        return r;
    },


    readI32:function(f) {
        var i32rd = new Array();
        i32rd = this.transport.readAll(0, 4);

        var r = {};
        r["value"] = ((i32rd[0] & 0xff) << 24) | ((i32rd[1] & 0xff) << 16) | ((i32rd[2] & 0xff) << 8) | ((i32rd[3] & 0xff));

        return r;
    },

    readI64:function() {
        var i64rd = new Array();
        i64rd = this.transport.readAll(0, 8);

        var r = {};
        var s = '';
        for (var i = 0; i < i64rd.length; i++) {
            var val = i64rd[i].toString(16).toUpperCase();
            if (val.length == 1) {
                val = "0" + val;
            }
            s = s + val;

        }
        r["value"] = parseInt(s, 16);
        return r;
    },

    readDouble:function() {
        return this.readI32()
    },

    readString:function() {
        var size = this.readI32().value;
        return this.readStringBody(size)
    },
    readStringBody:function(size) {
        var data = this.transport.readAll(0, size);
        var out = '';
        for (var i = 0; i < data.length; i++) {
            out = out + String.fromCharCode(data[i]);
        }
        var r = {};
        r["value"] = this.decode(out);
        return r;
    },

    readBinary:function() {
        return this.readString()
    },
    encode:function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    decode:function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    },

//Method to arbitrarily skip over data.
     skip:function(type) {
        switch(type){
            case Thrift.Type.BOOL:
                this.readBool();
                break;
            case Thrift.Type.DOUBLE:
                this.readDouble();
                break;
            case Thrift.Type.I16:
                this.readI16();
                break;
            case Thrift.Type.I32:
                this.readI32();
                break;
            case Thrift.Type.UTF7:
                break;
            case Thrift.Type.STRUCT:
                this.readStructBegin();
                while (true)
                {
                    var ret = this.readFieldBegin();
                    var fname = ret.fname;
                    var ftype = ret.ftype;
                    var fid = ret.fid;
                    if (ftype == Thrift.Type.STOP) {
                        break;
                    }
                    switch (fid)
                    {
                        case 1:
                            if (ftype == Thrift.Type.I32) {
                                this.errorCode = this.readI32().value;
                            } else {
                                this.skip(ftype);
                            }
                            break;
                        case 2:
                            if (ftype == Thrift.Type.STRING) {
                                this.parameter = input.readString().value;
                            } else {
                                this.skip(ftype);
                            }
                            break;
                        default:
                            this.skip(ftype);
                    }
                    this.readFieldEnd();
                }
                this.readStructEnd();
                break;
            default:
                break;
        }
    }

};


Thrift.objectLength = function(obj) {
    var length = 0;
    for (k in obj) {
        if (obj.hasOwnProperty(k)) {
            length++;
        }
    }
    return length;
};

Thrift.inherits = function(constructor, superConstructor) {
    // Prototypal Inheritance
    // http://javascript.crockford.com/prototypal.html
    function F() {
    }

    F.prototype = superConstructor.prototype;
    constructor.prototype = new F();
};


XMLHttpRequest.prototype.sendAsBinary = function(data) {
    var ords = new Array();
    for (var i = 0; i < data.length; i++) {
        ords.push(parseInt(data[i], 16));

    }

    var ui8a = new Uint8Array(ords);

    this.send(ui8a.buffer);
};
