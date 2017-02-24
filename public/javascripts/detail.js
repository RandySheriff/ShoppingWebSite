$(function (){
    
    $('select[name=QQ]').on('load change', function (e) {
        var parameters = { QQ: $('select[name=QQ]').val()};
        $.get("/score", parameters, function (data) {
            $('input[name=使用积分]').attr('placeholder', '0 ~ ' + data['积分']);
            $('input[name=使用积分]').append('<input type=hidden name=现有积分 value=' + data['积分'] + ' />');
            $('input[name=汇率]').val(data['汇率']);
        });
    });
    
    $('select[name=商品名称]').on('load change', function (e) {
        var parameters = { 名称: $('select[name=商品名称]').val()};
        $.get("/number", parameters, function (data) {
            $('input[name=商品数量]').attr('placeholder', '1 ~ ' + data['数量']);
            $('input[name=商品数量]').append('<input type=hidden name=现有数量 value=' + data['数量'] + ' />');
            $('input[name=价格]').val(data['价格']);
        });
    });
    
    $(document).ready(function () {
        
        if ( $('select[name=QQ]').length ) {
            
            var qqParam = { QQ: $('select[name=QQ]').val()};
            
            $.get("/score", qqParam, function (data) {
                $('input[name=使用积分]').attr('placeholder', '0 ~ ' + data['积分']);
                $('input[name=使用积分]').append('<input type=hidden name=现有积分 value=' + data['积分'] + ' />');
                $('select[name=QQ]').append('<input type=hidden name=汇率 value=' + data['汇率'] + ' />');
            });
        }
        
        if ( $('select[name=商品名称]').length ) {
            
            var nameParam = { 名称: $('select[name=商品名称]').val()};
            
            $.get("/number", nameParam, function (data) {
                $('input[name=商品数量]').attr('placeholder', '1 ~ ' + data['数量']);
                $('input[name=商品数量]').append('<input type=hidden name=现有数量 value=' + data['数量'] + ' />');
                $('select[name=商品名称]').append('<input type=hidden name=价格 value=' + data['价格'] + ' />');
            });
        }

        if ( $('input[name=订单状态]').length )
        {
            var status = $('input[name=订单状态]').val();
         
            if (status == '已取消' || status == '已结单')
            {
                $('input[name=订单状态]').attr('disabled', 'true');
                $('input[name=快递单号]').attr('disabled', 'true');
            }
            else
            {
                $('input[name=订单状态]').replaceWith('<select name=订单状态> \
                                                            <option value="未付款">未付款</option> \
                                                            <option value="已付款">已付款</option> \
                                                            <option value="已发货">已发货</option> \
                                                            <option value="已取消">已取消</option> \
                                                            <option value="已结单">已结单</option> \
                                                        </select>');

                $('select[name=订单状态]').val(status);
            }
        }
    });
});