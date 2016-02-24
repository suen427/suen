/*util*/
/*返回当前时刻的下个月*/
var MonthUtil = {
    init:function(settings){
        this.setMonth(settings.monthNum);
        this.monthLength = this.getDaysNumOfMonth(this.month);
        this.firstDay = this.month.getDay();//第一天是星期几
        this.firstWeekDay = this.month.getDay();
        this.double = Math.floor((this.monthLength + this.firstDay -1)/7);//一个月的连续双休日个数
        this.holiday = settings.holiday || this.monthLength - settings.workDayNum;
        this.firstSatday = 7-this.firstDay;
        this.firstSunday = (8-this.firstDay)%7;
        this.firstTuseday = (10 -this.firstDay)%7;
        if(this.firstSatday>this.firstSunday){ // 求周末天数
            if (this.monthLength>28){
                this.weekendDayNum = 9;
            }else {
                this.weekendDayNum = 8;
            }
        }else {
            var temp = this.monthLength - this.firstSatday;
            if(temp<28){
                this.weekendDayNum = 8;
            } else if (temp>28) {
                this.weekendDayNum = 10;
            } else {
                this.weekendDayNum = 9;
            }
        }
        var table = [0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0];
        this.table = table.slice(this.firstDay,this.firstDay+this.monthLength);
    },
    setMonth:function (monthNum){ // 获得下月日期对象，monthNum是月份数字0、1、2...11
        var date = new Date(),
            year = date.getFullYear();
        if( monthNum>=0 || monthNum<12){
            var month = monthNum;
        } else {
            var month = date.getMonth()+1;
        }
        this.month = new Date(year,month,1);
    },
    getDaysNumOfMonth:function(date){
        var year = date.getFullYear(),
            month = date.getMonth();
        if(year%4==0 && month==1){
            return 29;
        }else if(month==1){
            return 28;
        }
        switch (month) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
                break;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
                break;
        }
    }
}
var settings = {
    // monthNum:6,// 获得下月日期对象，monthNum是月份数字0、1、2...11
    workDayNum:24 // 一个月中的工作天数
}
MonthUtil.init(settings);
console.log(MonthUtil);

/*util end*/

/*Person*/
-function () {
    function Person(monthUtil){
        this.init(monthUtil);
    }
    Person.prototype = {
        init: function (monthUtil) {
            /*
            * table是Person的排班表array
            * 0表示休息，其余正整数代表不同岗位
            * */
            this.table = new Array(monthUtil.monthLength);
            this.holiday = monthUtil.holiday;
        },
        setPre: function (preArr){ // 预先设置班表
            this.table = preArr.slice(0);
        },
        setholidayNum: function (num) {
            this.holiday = num;
        },
        jobs:["岗1","岗2","岗3","岗4"],
        setJobs: function (jobs) {
            this.jobs = jobs;
        },
        scheduleDouble: function (monthUtil) { // 双休排班方法
            for(var i = 0; i<monthUtil.monthLength; i++){
                this.table[i] = this.table[i]||monthUtil.table[i];
            }
        }
    };
    window.Person = Person;
}();
/*Person end*/

/*Team*/

function Team(settings){
    this.init = function(settings){

    }
}

/*test*/
var p = new Person(MonthUtil);
console.log(p)
