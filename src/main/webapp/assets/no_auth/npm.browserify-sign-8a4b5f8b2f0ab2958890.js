(window.webpackJsonp=window.webpackJsonp||[]).push([[73],{2282:function(e){e.exports=JSON.parse('{"sha224WithRSAEncryption":{"sign":"rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"RSA-SHA224":{"sign":"ecdsa/rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"sha256WithRSAEncryption":{"sign":"rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"RSA-SHA256":{"sign":"ecdsa/rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"sha384WithRSAEncryption":{"sign":"rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"RSA-SHA384":{"sign":"ecdsa/rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"sha512WithRSAEncryption":{"sign":"rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA512":{"sign":"ecdsa/rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA1":{"sign":"rsa","hash":"sha1","id":"3021300906052b0e03021a05000414"},"ecdsa-with-SHA1":{"sign":"ecdsa","hash":"sha1","id":""},"sha256":{"sign":"ecdsa","hash":"sha256","id":""},"sha224":{"sign":"ecdsa","hash":"sha224","id":""},"sha384":{"sign":"ecdsa","hash":"sha384","id":""},"sha512":{"sign":"ecdsa","hash":"sha512","id":""},"DSA-SHA":{"sign":"dsa","hash":"sha1","id":""},"DSA-SHA1":{"sign":"dsa","hash":"sha1","id":""},"DSA":{"sign":"dsa","hash":"sha1","id":""},"DSA-WITH-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-WITH-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-WITH-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-WITH-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-RIPEMD160":{"sign":"dsa","hash":"rmd160","id":""},"ripemd160WithRSA":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"RSA-RIPEMD160":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"md5WithRSAEncryption":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"},"RSA-MD5":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"}}')},2305:function(e){e.exports=JSON.parse('{"1.3.132.0.10":"secp256k1","1.3.132.0.33":"p224","1.2.840.10045.3.1.1":"p192","1.2.840.10045.3.1.7":"p256","1.3.132.0.34":"p384","1.3.132.0.35":"p521"}')},3184:function(e,t,n){e.exports=n(2282)},3206:function(e,t,n){(function(t){var a=n(1743),i=n(330),r=n(62),s=n(3207),h=n(3238),d=n(2282);function Sign(e){i.Writable.call(this);var t=d[e];if(!t)throw new Error("Unknown message digest");this._hashType=t.hash,this._hash=a(t.hash),this._tag=t.id,this._signType=t.sign}function Verify(e){i.Writable.call(this);var t=d[e];if(!t)throw new Error("Unknown message digest");this._hash=a(t.hash),this._tag=t.id,this._signType=t.sign}function createSign(e){return new Sign(e)}function createVerify(e){return new Verify(e)}Object.keys(d).forEach((function(e){d[e].id=new t(d[e].id,"hex"),d[e.toLowerCase()]=d[e]})),r(Sign,i.Writable),Sign.prototype._write=function _write(e,t,n){this._hash.update(e),n()},Sign.prototype.update=function update(e,n){return"string"==typeof e&&(e=new t(e,n)),this._hash.update(e),this},Sign.prototype.sign=function signMethod(e,t){this.end();var n=this._hash.digest(),a=s(n,e,this._hashType,this._signType,this._tag);return t?a.toString(t):a},r(Verify,i.Writable),Verify.prototype._write=function _write(e,t,n){this._hash.update(e),n()},Verify.prototype.update=function update(e,n){return"string"==typeof e&&(e=new t(e,n)),this._hash.update(e),this},Verify.prototype.verify=function verifyMethod(e,n,a){"string"==typeof n&&(n=new t(n,a)),this.end();var i=this._hash.digest();return h(n,i,e,this._signType,this._tag)},e.exports={Sign:createSign,Verify:createVerify,createSign,createVerify}}).call(this,n(163).Buffer)},3207:function(e,t,n){(function(t){var a=n(2280),i=n(1975),r=n(1976).ec,s=n(1563),h=n(1842),d=n(2305);function getKey(e,n,i,r){if((e=new t(e.toArray())).length<n.byteLength()){var s=new t(n.byteLength()-e.length);s.fill(0),e=t.concat([s,e])}var h=i.length,d=function bits2octets(e,n){e=(e=bits2int(e,n)).mod(n);var a=new t(e.toArray());if(a.length<n.byteLength()){var i=new t(n.byteLength()-a.length);i.fill(0),a=t.concat([i,a])}return a}(i,n),o=new t(h);o.fill(1);var c=new t(h);return c.fill(0),c=a(r,c).update(o).update(new t([0])).update(e).update(d).digest(),o=a(r,c).update(o).digest(),{k:c=a(r,c).update(o).update(new t([1])).update(e).update(d).digest(),v:o=a(r,c).update(o).digest()}}function bits2int(e,t){var n=new s(e),a=(e.length<<3)-t.bitLength();return a>0&&n.ishrn(a),n}function makeKey(e,n,i){var r,s;do{for(r=new t(0);8*r.length<e.bitLength();)n.v=a(i,n.k).update(n.v).digest(),r=t.concat([r,n.v]);s=bits2int(r,e),n.k=a(i,n.k).update(n.v).update(new t([0])).digest(),n.v=a(i,n.k).update(n.v).digest()}while(-1!==s.cmp(e));return s}function makeR(e,t,n,a){return e.toRed(s.mont(n)).redPow(t).fromRed().mod(a)}e.exports=function sign(e,n,a,o,c){var g=h(n);if(g.curve){if("ecdsa"!==o&&"ecdsa/rsa"!==o)throw new Error("wrong private key type");return function ecSign(e,n){var a=d[n.curve.join(".")];if(!a)throw new Error("unknown curve "+n.curve.join("."));var i=new r(a).keyFromPrivate(n.privateKey).sign(e);return new t(i.toDER())}(e,g)}if("dsa"===g.type){if("dsa"!==o)throw new Error("wrong private key type");return function dsaSign(e,n,a){var i,r=n.params.priv_key,h=n.params.p,d=n.params.q,o=n.params.g,c=new s(0),g=bits2int(e,d).mod(d),u=!1,p=getKey(r,d,e,a);for(;!1===u;)i=makeKey(d,p,a),c=makeR(o,i,h,d),0===(u=i.invm(d).imul(g.add(r.mul(c))).mod(d)).cmpn(0)&&(u=!1,c=new s(0));return function toDER(e,n){e=e.toArray(),n=n.toArray(),128&e[0]&&(e=[0].concat(e));128&n[0]&&(n=[0].concat(n));var a=[48,e.length+n.length+4,2,e.length];return a=a.concat(e,[2,n.length],n),new t(a)}(c,u)}(e,g,a)}if("rsa"!==o&&"ecdsa/rsa"!==o)throw new Error("wrong private key type");e=t.concat([c,e]);for(var u=g.modulus.byteLength(),p=[0,1];e.length+p.length+1<u;)p.push(255);p.push(0);for(var f=-1;++f<e.length;)p.push(e[f]);return i(p,g)},e.exports.getKey=getKey,e.exports.makeKey=makeKey}).call(this,n(163).Buffer)},3238:function(e,t,n){(function(t){var a=n(1563),i=n(1976).ec,r=n(1842),s=n(2305);function checkValue(e,t){if(e.cmpn(0)<=0)throw new Error("invalid sig");if(e.cmp(t)>=t)throw new Error("invalid sig")}e.exports=function verify(e,n,h,d,o){var c=r(h);if("ec"===c.type){if("ecdsa"!==d&&"ecdsa/rsa"!==d)throw new Error("wrong public key type");return function ecVerify(e,t,n){var a=s[n.data.algorithm.curve.join(".")];if(!a)throw new Error("unknown curve "+n.data.algorithm.curve.join("."));var r=new i(a),h=n.data.subjectPrivateKey.data;return r.verify(t,e,h)}(e,n,c)}if("dsa"===c.type){if("dsa"!==d)throw new Error("wrong public key type");return function dsaVerify(e,t,n){var i=n.data.p,s=n.data.q,h=n.data.g,d=n.data.pub_key,o=r.signature.decode(e,"der"),c=o.s,g=o.r;checkValue(c,s),checkValue(g,s);var u=a.mont(i),p=c.invm(s);return 0===h.toRed(u).redPow(new a(t).mul(p).mod(s)).fromRed().mul(d.toRed(u).redPow(g.mul(p).mod(s)).fromRed()).mod(i).mod(s).cmp(g)}(e,n,c)}if("rsa"!==d&&"ecdsa/rsa"!==d)throw new Error("wrong public key type");n=t.concat([o,n]);for(var g=c.modulus.byteLength(),u=[1],p=0;n.length+u.length+2<g;)u.push(255),p++;u.push(0);for(var f=-1;++f<n.length;)u.push(n[f]);u=new t(u);var w=a.mont(c.modulus);e=(e=new a(e).toRed(w)).redPow(new a(c.publicExponent)),e=new t(e.fromRed().toArray());var y=p<8?1:0;for(g=Math.min(e.length,u.length),e.length!==u.length&&(y=1),f=-1;++f<g;)y|=e[f]^u[f];return 0===y}}).call(this,n(163).Buffer)}}]);
//# sourceMappingURL=npm.browserify-sign-8a4b5f8b2f0ab2958890.js.map