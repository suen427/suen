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
        var tableA = [0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0,
            0,1,1,1,1,1,0],
            tableB = [0,1,1,1,1,1,1,
                0,1,1,1,1,1,1,
                0,1,1,1,1,1,1,
                0,1,1,1,1,1,1,
                0,1,1,1,1,1,1];
        this.tableA = tableA.slice(this.firstDay-1,this.firstDay+this.monthLength-1);
        this.tableB = tableB.slice(this.firstDay-1,this.firstDay+this.monthLength-1);
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
    function Person(settings,monthUtil){
        this.init(settings,monthUtil);
    }
    Person.prototype = {
        init: function (settings, monthUtil) {
            /*
            * table是Person的排班表array
            * 0表示休息，其余正整数代表不同岗位
            * */
            this.table = new Array(monthUtil.monthLength);
            this.holiday = monthUtil.holiday;
            this.type = settings.type;
            this.name = settings.name;
        },
        setPre: function (preArr){ // 预先设置班表
            this.table = preArr.slice(0);
        },
        setHolidayNum: function (num) {
            this.holiday = num;
        },
        jobs:["休","岗1","岗2","岗3","岗4"],
        setJobs: function (jobs) {
            this.jobs = jobs;
        },
        setSchedule: function (monthUtil) { // 双休排班方法
            if (this.type == "A"){
                for(var i = 0; i<monthUtil.monthLength; i++){
                    this.table[i] = this.table[i]||monthUtil.tableA[i];
                }
            }else if(this.type == "B"){
                for(var i = 0; i<monthUtil.monthLength; i++){
                    this.table[i] = this.table[i]||monthUtil.tableB[i];
                }
            }
        }
    };
    window.Person = Person;
}();
/*Person end*/

/*Team*/

function Team(settings){
    this.init(settings);
}
Team.prototype = {
    init: function(settings){
        this.jobs = settings.jobs;
        var persons = settings.persons;
        this.menbers = [];
        for ( var i = 0; i < persons.length; i++){
            this.menbers[i] = new Person(persons[i],MonthUtil);
        }
        var menbersC = [];
        for(var i = 0; i < this.menbers.length; i++ ){
            var menber = this.menbers[i];
            if(menber.type == "C"){
                menbersC.push(menber);
            } else {
                menber.setSchedule(MonthUtil);
            }
        }
        this.menbersC = menbersC;
    },
    setSchedule: function(){ // 设置type为C的员工的班表
        var menbers = this.menbersC;
        var jobs = this.jobs;

    }
}

/*test*/
var teamSetting = {
    jobs:["岗1","岗2","岗3","岗4"],
    persons:[
        {name:"戎超群",type:"C"},
        {name:"吴艳",type:"C"},
        {name:"吴丹丹",type:"C"},
        {name:"叶佳莹",type:"C"},
        {name:"张智",type:"C"},
        {name:"夏雨",type:"C"},
        {name:"谢素梅",type:"A"},
        {name:"邬凯",type:"A"},
        {name:"向前",type:"A"},
        {name:"司超",type:"A"},
        {name:"谢素梅",type:"A"},
        {name:"沈桂玲",type:"B"},
        {name:"宓雪玲",type:"B"},
        {name:"谢少华",type:"B"}
    ]
}
var team = new Team(teamSetting);
team.setSchedule();
console.log(team);
