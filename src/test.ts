// Welcome to the TypeScript Playground, this is a website
// which gives you a chance to write, share and learn TypeScript.

// You could think of it in three ways:
//
//  - A location to learn TypeScript where nothing can break
//  - A place to experiment with TypeScript syntax, and share the URLs with others
//  - A sandbox to experiment with different compiler features of TypeScript

const anExampleVariable = "Hello World"
console.log(anExampleVariable)

// To learn more about the language, click above in "Examples" or "What's New".
// Otherwise, get started by removing these comments and the world is your playground.


function isWhileSpace(inputChar:string){
    return inputChar === ' ' || inputChar === '\n' || inputChar === '\t' || inputChar === '\v' || inputChar === '\b' || inputChar === '\r' || inputChar === '\f' ;
}

let line = 'curl -H "Host: xxm.ximalaya.com" -H "Cookie: personalized=1; domain=.ximalaya.com; path=/; channel=ios_kx; 1&_device=iPhone&56289E34-CE1A-42B2-B635-067992260C92&2.31.0; impl=com.xdsh.ximaoer; XUM=56289E34-CE1A-42B2-B635-067992260C92; c-oper=%E7%94%B5%E4%BF%A1; net-mode=WIFI; res=1170%2C2532; manufacturer=app; 1&_token=264503403&AE52A6F0140C88B485E2C5C5E3E419106321BD6B92C16FDB9782311261866BCA4A6C41EEF20F230M24A6699B0D14D27_; babyId=36744990005; device=iPhone; version=2.31.0; osversion=15.4; deviceId=56289E34-CE1A-42B2-B635-067992260C92; uid=264503403; token=AE52A6F0140C88B485E2C5C5E3E419106321BD6B92C16FDB9782311261866BCA4A6C41EEF20F230M24A6699B0D14D27_; idfa=56289E34-CE1A-42B2-B635-067992260C92; userActiveTime=20220122; device_model=iPhone14,2; XD=ENnyJ+fF48WPaNxQ1RX745STLLqwfJnwUCF0PiyX81Zb1laH7H/17eU8OY5AtgogjYk9/3Lm7UTRPQ4p/mhrsQ==" -H "content-type: application/json" -H "accept: */*" -H "if-modified-since: Wed, 06 Apr 2022 07:20:24 GMT" -H "user-agent: ximalayababy_v2.31.0_c5(CFNetwork, iOS 15.4, iPhone14,2);xmly(baby)/2.31.0/iOS_1" -H "accept-language: zh-Hans-CN;q=1, en-CN;q=0.9" --data-binary "{\\"categoryId\\":13025,\\"pageSize\\":20,\\"currentPage\\":1}" --compressed "https://27.36.120.228/mobile/album/categoryAlbum/queryCategoryContent"'

let data:Array<string> = [];
let currentLine:Array<string> = [];
let stack:Array<string> = [];

var idx = 0;
for(;idx<line.length;idx++){
    let cc = line[idx];

    if (cc === '\\' && idx < line.length) {
        currentLine.push(cc);
        idx += 1;
        currentLine.push(line[idx]);
    } else if (stack.length >0 && stack[stack.length-1] === cc) {
        stack.pop();
        data.push(currentLine.join(""));
        currentLine = [];
    } else if (stack.length === 0 && isWhileSpace(cc)) {
        data.push(currentLine.join(""));
        currentLine = [];
    } else if ( currentLine.length === 0 && ( cc === '"' || cc === "'") ){
        stack.push(cc);
    }else{
        currentLine.push(cc);
    }
}
data.push(currentLine.join(""));
console.log(data.join("\n"));
