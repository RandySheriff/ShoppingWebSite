$(function (){
    
    $(document).ready(function () {
        var today = new Date();
        $('input[name="起始日期"]').datepicker({dateFormat: "yy-mm-dd"});
        $('input[name="截止日期"]').datepicker({dateFormat: "yy-mm-dd"});
        $('select[name="订单状态"]').val($('input[name="status"]').val());
    });
});

