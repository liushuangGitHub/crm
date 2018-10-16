let http = require('http');
let fs = require('fs');
let url = require('url');

let server = http.createServer((req, res) => {
    // 1. 首先加载inde.html文件
    let {
        pathname,
        query
    } = url.parse(req.url, true);
    if (pathname == '/') {
        let home = fs.readFileSync('./index.html', 'utf-8');
        res.end(home);
        return;
    }
    if (pathname === '/performance-now,js.map' || pathname === '/favicon.ico') {
        res.end();
        return;
    }

    let reg = /\.(\w+)$/g;
    if (reg.test(pathname)) {
        let con = fs.readFileSync('.' + pathname, 'utf-8');
        res.end(con);
        return;
    }

    var dataUrl = './data.json';
    var dataSuc = {
        'code': 0,
        'msg': 'success',
        'data': null
    };
    if (pathname === '/getList') {
        let con = fs.readFileSync(dataUrl, 'utf-8');
        // 为了更加规范，将数据添加到对象中
        dataSuc.data = con;
        res.end(JSON.stringify(dataSuc));
        return
    }

    // 增加
    if (pathname == '/addInfo') {
        var str = '';
        // 接收前端发送的data数据
        req.on('data', function (res) {
            str += res;
        });
        // 获取data数据之后，将数据插入本地文件中
        req.on('end', function () {
            // console.log(str);
            str = JSON.parse(str);
            let data = JSON.parse(fs.readFileSync(dataUrl, 'utf-8'));
            // console.log(data.length);
            str.id = data[data.length - 1]['id'] + 1;
            data.push(str);
            console.log(data);

            fs.writeFileSync(dataUrl, JSON.stringify(data), 'utf-8');
            res.end(JSON.stringify(dataSuc));
        })
    }

    if (pathname === '/getInfo') {
        let data = JSON.parse(fs.readFileSync(dataUrl, 'utf-8'));
        for (let i = 0; i < data.length; i++) {
            if (data[i]['id'] == query.id) {
                dataSuc.data = data[i];
            }
        }
        res.end(JSON.stringify(dataSuc));
    }

    if (pathname === '/updateInfo') {
        var str = '';
        req.on('data', function (res) {
            str += res;
        });
        req.on('end', function () {
            let newStr = JSON.parse(str);
            let data = JSON.parse(fs.readFileSync(dataUrl, 'utf-8'));
            for (let i = 0; i < data.length; i++) {
                if (data[i]['id'] == newStr['id']) {
                    data[i] = newStr;
                }
            }
            
            fs.writeFileSync(dataUrl,JSON.stringify(data),'utf-8');
            res.end(JSON.stringify(dataSuc));
        })
    }
    if (pathname ==='/removeInfo') {
        let data = JSON.parse(fs.readFileSync(dataUrl,'utf-8'));
        for (let i = 0; i < data.length; i++) {
            if ( data[i]['id'] == query['id']) {
                data.splice(i,1);
                break;
            }
        }
        fs.writeFileSync(dataUrl,JSON.stringify(data),'utf-8');
        dataSuc.data = data
        res.end(JSON.stringify(dataSuc));
    }


})

server.listen(9999, () => {
    console.log('端口9999已经启动');
})