var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var file = "test11.db";
var exist = fs.existsSync(file);
var db = new sqlite3.Database(file);

function GetKey(table)
{
    if (exist)
    {   
        if (table == '商品')
        {
            var ret = 1;
            
            query = 'select max(编号) from 商品';
            
            db.all(query, function(err, rows) {

                ret = ret + rows[0]['max(编号)'];
            });
            
            return ret;
        }
        else if (table == '客户')
        {
            return '客户';
        }
        else if (table == '订单')
        {
            return '订单';
        }
        else
        {
            return '';
        }
    }
    else
    {
        console.log("db not exist");  
        return '';
    }
}

function TranslateTableName(table)
{
    if (table == 'goods')
    {
        return '商品';
    }
    else if (table == 'clients')
    {
        return '客户';
    }
    else if (table == 'orders')
    {
        return '订单';
    }
    else if (table == 'neworders')
    {
        return '新订单';
    }
    else if (table == 'rates')
    {
        return '汇率';
    }
    else
    {
        return '';
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    
    if (req.session.authenticated)
    {
        res.render('index', { isAdmin: 'yes' });
    }
    else
    {
        res.render('index');
    }
});

router.get('/admin', function(req, res, next) {
    
    if (req.session.authenticated)
    {
        res.render('admin', { title: 'admin', name: 'Wen' });
    }
    else
    {
        res.redirect('/login');
    }
});

router.post('/admin', function(req, res){
    
    if (req.body.管理员名称 == 'wen' && req.body.管理员密码 == '19830528')
    {
        req.session.authenticated = true;

        res.redirect('/admin');
    }
    else
    {
         req.session.authenticated = false;
         
        res.redirect('/login');
    }
});


router.get('/login', function(req, res, next) {
    
    if (req.session.authenticated == false)
    {
        res.render('login', {prompt: '名称或密码错误, 请重新输入'});
    }
    else
    {
        res.render('login');
    }
});

router.get('/score', function(req, res, next) {
    if (exist)
    {
        query = 'select 积分, 汇率 from 客户 inner join 汇率 on 客户.等级 = 汇率.等级 where QQ=\"' + req.query.QQ + '\"';

        db.all(query, function(err, rows) {
            
            res.send( { '积分' : rows[0]['积分'], '汇率' : rows[0]['汇率'] } );
        });
    }
    else
    {
        console.log("db not exist");  
    }
});

router.get('/number', function(req, res, next) {
    if (exist)
    {
        query = 'select 数量, 价格 from 商品 where 名称=\"' + req.query.名称 + '\"';

        db.all(query, function(err, rows) {

            res.send( { '数量' : rows[0]['数量'], '价格' : rows[0]['价格'] } );
        });
    }
    else
    {
        console.log("db not exist");  
    }
});

function HasValue(variable)
{
    if (variable != undefined && variable != '')
    {
        return true;
    }
    else
    {
        return false;
    }
}

router.post('/query', function(req, res){

    if (exist)
    {    
        query = 'select * from 订单';
        
        var conditions = [];
        
        if (HasValue(req.body.订单号))
        {
            conditions.push('订单号=\"' + req.body.订单号 + '\"');
        }
        
        if (HasValue(req.body.QQ))
        {
            conditions.push('QQ=\"' + req.body.QQ + '\"');
        }
        else if (req.session.authenticated != true)
        {
            conditions.push('QQ=\"-\"');
        }
        
        if (HasValue(req.body.商品名称))
        {
            conditions.push('商品名称=\"' + req.body.商品名称 + '\"');
        }
        
        if (HasValue(req.body.订单状态))
        {
            conditions.push('订单状态=\"' + req.body.订单状态 + '\"');
        }
        
        if (HasValue(req.body.起始日期))
        {
            conditions.push('下单时间>=Date(\"' + req.body.起始日期 + '\", \"-1 day\")');
        }

        if (HasValue(req.body.截止日期))
        {
            conditions.push('下单时间<=Date(\"' + req.body.截止日期 + '\")');
        }
    
        if (conditions.length > 0)
        {
            query = query + ' where ';
            
            for (var cond in conditions)
            {
                query = query + conditions[cond] + ' and ';
            }
            
            query = query.substring(0, query.length - 5);
        }

        var admin = 'yes';
        
        if (req.session.authenticated != true)
        {
            admin = 'no';
        }
    
        db.all(query, function(err, rows) {
            
            var sum = 0.0;
            
            for (var i in rows)
            {
                sum = sum +　parseFloat(rows[i]['总价']);
            }
        
            res.render('order', { rows: rows, 订单号: req.body.订单号, QQ:req.body.QQ, 商品名称:req.body.商品名称,
                订单状态: req.body.订单状态, 起始日期: req.body.起始日期, 截止日期: req.body.截止日期, isAdmin: admin, allCost: sum});
        });
    }
    else
    {
        console.log("db not exist");  
    }
});

router.post('/new', function(req, res){
  if (exist)
  {
    query = '';
    
    var table = TranslateTableName(req.body.table);
    
    if (table == '客户')
    {
        query = 'insert into 客户 values (\"' + req.body.QQ + 
                '\", ' + req.body.等级 +
                ', ' + req.body.积分 +
                ')';
    }
    else if (table == '商品')
    {
        query = 'insert into 商品 values (\"' + req.body.编号 +
                '\", \"' + req.body.名称 + 
                '\", ' + req.body.数量 +
                ', \"' + req.body.颜色 +
                '\", ' + req.body.尺寸 +
                ', ' + req.body.价格 +
                ')';
    }
    else if (table == '订单')
    {
        query = 'insert into 订单 values (\"' + req.body.订单号 +
                '\", \"' + req.body.QQ +
                '\", \"' + req.body.商品名称 +
                '\", ' + req.body.商品数量 +
                ', \"' + req.body.地址 +
                '\", ' + req.body.运费 +
                ', ' + req.body.汇率 +
                ', ' + req.body.使用积分 +
                ', ' + GetPrice(req.body.价格, req.body.商品数量, req.body.汇率, req.body.运费, req.body.使用积分) + 
                ', \"' + GetTime() +
                '\", \"未付款\"' + 
                ', \"0\"' +
                ')';
    }
    
    if (query != '')
    { 
        db.run(query, function(err) {
            
            if(err){
                
                console.log(err);
            }
            else
            {
                if (table == '订单')
                {
                    query = 'update 客户 set 积分=' + (parseInt(req.body.现有积分) - parseInt(req.body.使用积分)).toString() +　
                            ' where QQ=\"' + req.body.QQ + '\"';

                    db.run(query, function(err) {
                        if(err){
                            console.log(err);
                        }
                    });

                    query = 'update 商品 set 数量=' + (parseInt(req.body.现有数量) - parseInt(req.body.商品数量)).toString() + 
                            ' where 名称=\"' + req.body.商品名称 + '\"';

                    db.run(query, function(err) {
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }
        });
    }
    
    res.redirect("/list?table=" + req.body.table);
  }
  else
  {
    console.log("db not exist");
  }    
});

function GetPrice(price, count, exchange, transport, score)
{
    var ret = parseFloat(price) * parseFloat(count) * parseFloat(exchange) + parseFloat(transport) - parseFloat(score);
    
    return ret.toString();
}

router.post('/edit', function(req, res){
  if (exist)
  {
    query = '';
    
    var table = TranslateTableName(req.body.table);

    if (table == '客户')
    {
        query = 'update ' + table + ' set 等级=' + req.body.等级 +
                ', 积分=' + req.body.积分 +
                ' where QQ=\"' + req.body.QQ + '\"';
    }
    else if (table == '商品')
    {
        query = 'update ' + table + ' set 名称=\"' + req.body.名称 + 
                '\", 数量=' + req.body.数量 +
                ', 颜色=\"' + req.body.颜色 +
                '\", 尺寸=' + req.body.尺寸 +
                ', 价格=' + req.body.价格 +
                ' where 编号=' + req.body.编号;
    }
    else if (table == '订单')
    {
        query = 'update ' + table + ' set 订单状态=\"' + req.body.订单状态 +
                '\", 快递单号=\"' + req.body.快递单号 + '\" where 订单号=\"' + req.body.订单号 + '\"';
    }
    else if (table == '汇率')
    {
        query = 'update ' + table + ' set 汇率=' + req.body.汇率 +
                ' where 等级=' + req.body.等级;
    }
    
    if (query != '')
    {  
        db.run(query, function(err) {
            
            if(err) {
                
                console.log(err);
                
            }
            else
            {
                if (table == '订单')
                {
                    if (req.body.订单状态 == '已取消')
                    {
                        query = 'select QQ, 商品名称, 商品数量, 使用积分 from 订单 where 订单号=\"' + req.body.订单号 + '\"';

                        db.all(query, function (err, rows)
                        {
                            var QQ = rows[0]['QQ'];
                            
                            var good = rows[0]['商品名称'];
                            
                            var num = parseInt(rows[0]['商品数量']);
                            
                            var score = parseInt(rows[0]['使用积分']);
                            
                            query = 'select 数量 from 商品 where 名称=\"' + good + '\"';
                            
                            db.all(query, function (err, rows)
                            {
                                
                                query = 'update 商品 set 数量=' + (parseInt(rows[0]['数量']) + num).toString() +
                                    ' where 名称=\"' + good + '\"';

                                db.run(query, function(err) {
                                    if(err){
                                        console.log(err);
                                    }
                                });
                    
                            });
                            
                            query = 'select 积分 from 客户 where QQ=\"' + QQ + '\"';
                            
                            db.all(query, function (err, rows)
                            {
                                query = 'update 客户 set 积分=' + (parseInt(rows[0]['积分']) + score).toString() +
                                    ' where QQ=\"' + QQ + '\"';
                                    
                                db.run(query, function(err)
                                {
                                    if(err){
                                        console.log(err);
                                    }
                                });
                            });
                        });
                    }
                    else if (req.body.订单状态 == '已结单')
                    {
                        query = 'select QQ, 总价 from 订单 where 订单号=\"' + req.body.订单号 + '\"';

                        db.all(query, function (err, rows)
                        {
                            var QQ = rows[0]['QQ'];
                            
                            var price = Math.floor(parseFloat(rows[0]['总价']));
                            
                            query = 'select 积分 from 客户 where QQ=\"' + QQ + '\"';
                            
                            db.all(query, function (err, rows)
                            {
                                var newScore = parseInt(rows[0]['积分']) + price;
                                
                                query = 'update 客户 set 积分=' + newScore.toString() +
                                    ' where QQ=\"' + QQ + '\"';
                                    
                                db.run(query, function(err)
                                {
                                    if(err){
                                        console.log(err);
                                    }
                                });
                                
                                query = '';
                                
                                if (newScore >= 20000)
                                {
                                    query = 'update 客户 set 等级=3' + ' where QQ=\"' + QQ + '\"';
                                }
                                else if (newScore >= 2000)
                                {
                                    query = 'update 客户 set 等级=2' + ' where QQ=\"' + QQ + '\"';
                                }
                                
                                if (query != '')
                                {
                                    db.run(query, function(err)
                                    {
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }
                            });
                        });
                    }
                }
            }
        });
    }
    
    res.redirect("/list?table=" + req.body.table);
  }
  else
  {
    console.log("db not exist");
  }    
});

router.get('/detail', function(req, res, next) {
    
  var table = TranslateTableName(req.query.table);
        
  if (exist)
  { 
    if (req.query.operation == 'edit')
    {
        query = "SELECT * FROM " + table + " where ";
        
        if (table == '商品')
        {
            query = query + '编号=\"' + req.query.id + '\"';
        }
        else if (table == '客户')
        {
            query = query + 'QQ=\"' + req.query.id + '\"';
        }
        else if (table == '订单')
        {
            query = 'SELECT 订单号, 订单状态, 快递单号 FROM 订单 WHERE 订单号=\"' + req.query.id + '\"';
        }
        else if (table == '汇率')
        {
            query = query + '等级=\"' + req.query.id + '\"';
        }

        db.all(query, function(err, rows) {

            res.render('detail', { table: req.query.table, caption: '取消修改，回到上页', button: "提交修改", operation: req.query.operation, row: rows[0] });
        });
    }
    else if (req.query.operation == 'new')
    {  
        if (table == '商品')
        {
            query = 'select max(编号) from 商品';
            
            db.all(query, function(err, rows) {
                NewDetail(rows[0]["max(编号)"] + 1, req.query.table, req.query.operation, res);
            });
        }
        else if (table == '订单')
        {
            var milliseconds = new Date().getTime() % 100000000;
            
            NewDetail(milliseconds, req.query.table, req.query.operation, res);
        }
        else
        {
            NewDetail('', req.query.table, req.query.operation, res);
        }
    }
  }
  else
  {
    console.log("db not exist");
  }
});

function GetTime()
{
    var date = new Date();
    return date.toISOString().substring(0, 10);
}

function NewDetail(key, table, operation, res)
{
    var cnTable = TranslateTableName(table);
    
    if (cnTable == '订单')
    {
        cnTable = '新订单';
    }
      
    newRow = {};
    
    db.each('PRAGMA table_info(' + cnTable + ')', function(err, col) {
            if (Object.keys(newRow).length == 0)
            {
                 newRow[col.name] = key;
            }
            else
            {
                if (cnTable == '客户')
                {
                    newRow['等级'] = '1';
                    newRow['积分'] = '0';
                }
                else
                {
                    newRow[col.name] = '';
                }
            }
        },
        function (err, rows) {
            
            if (cnTable == '新订单')
            {
                query = 'select QQ from 客户';

                db.all(query, function(err, qqRows) {
                      
                    newRow['QQ'] = [];

                    for (var idx in qqRows)
                    {
                        newRow['QQ'].push(qqRows[idx]['QQ']);
                    }

                    query = 'select 名称 from 商品';
                    
                    db.all(query, function(err, goodRows) {
                        
                        newRow['商品名称'] = [];
                        
                        for (var idx in goodRows)
                        {
                            newRow['商品名称'].push(goodRows[idx]['名称']);
                        }
                    
                        res.render('detail', { table: table, caption: '停止添加，回到上页', button: "提交新项", operation: operation, row: newRow });
                    });
                });
            }
            else
            {
                res.render('detail', { table: table, caption: '停止添加，回到上页', button: "提交新项", operation: operation, row: newRow });        
            }
    }); 
}

router.get('/list', function(req, res, next) {
    
  if (exist)
  {
    var table = TranslateTableName(req.query.table);
          
    if (req.query.operation == 'delete')
    {
        query = 'delete from ' + table + ' where ';
        
        if (table == '商品')
        {
            query = query + '编号=' + req.query.id;
        }
        else if (table == '客户')
        {
            query = query + 'QQ=\"' + req.query.id + '\"';
        }
        else if (table == '订单')
        {
            query = query + '订单号=' + req.query.id;
        }
        else if (table == '汇率')
        {
            query = query + '等级=' + req.query.id;
        }

        db.run(query, function(err) {
            if(err){
                console.log(err)
            }
        });
    }
    
    db.all('SELECT * FROM ' + table, function(err, rows) {
            
            addItem = '';
            
            enableRemove = 'yes';
            
            enableEdit = 'yes';
            
            if (table== '商品')
            {
                addItem = '添加新商品';

                enableEdit = 'no';
            }
            else if (table == '客户')
            {
                addItem = '添加新客户';

                enableEdit = 'no';
            }
            else if (table == '订单')
            {
                addItem = '添加新订单';
                
                enableRemove = 'no';
            }
            else
            {
                enableRemove = 'no';
            }

            res.render('list', { table: req.query.table, addItem: addItem, enableEdit: enableEdit, enableRemove: enableRemove, rows: rows });
        });
  }
  else
  {
        console.log("db not exist");
  }
});


module.exports = router;
