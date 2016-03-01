/*MonthUtil*/
/*返回当前时刻的下个月*/
function MonthUtil(settings){
    this.init(settings);
}
MonthUtil.prototype = {
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
};
var settings = {
    //monthNum:1,// 获得下月日期对象，monthNum是月份数字0、1、2...11
    workDayNum:24 // 一个月中的工作天数
};
var monthUtil = new MonthUtil(settings);
console.log(monthUtil);
/*MonthUtil end*/
/*Person*/
-function () {
    function Person(settings,monthUtil){
        this.init(settings,monthUtil);
    }
    Person.prototype = {
        init: function (settings, monthUtil) {
            this.monthUtil = monthUtil;
            /*
            * table是Person的排班表array
            * -1表示未排班,0表示休息，其余正整数代表不同岗位
            * */
            this.table = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1].slice(0,monthUtil.monthLength);
            this.holiday = monthUtil.holiday;
            this.type = settings.type;
            this.name = settings.name;
            this.stat={};
            this.computeStat();
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
        setSchedule: function () { // 双休排班方法
            if (this.type == "A"){
                for(var i = 0; i<this.monthUtil.monthLength; i++){
                    this.table[i] = this.table[i]>-1?this.table[i]:this.monthUtil.tableA[i];
                }
            }else if(this.type == "B"){
                for( i = 0; i<this.monthUtil.monthLength; i++){
                    this.table[i] = this.table[i]>-1?this.table[i]:this.monthUtil.tableB[i];
                }
            }
            this.computeStat();
        },
        computeStat: function () {
            this.stat = {};
            for(var i = 0; i < this.table.length; i++ ){
                if(this.table[i]>-1){
                    this.stat[this.jobs[this.table[i]]] = this.stat[this.jobs[this.table[i]]]+1||1;
                }else{
                    this.stat['rest'] = this.stat['rest']+1||1;
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
        this.monthUtil = settings.monthUtil;
        this.jobs = settings.jobs;
        var persons = settings.persons;
        this.menbers = [];
        for ( var i = 0; i < persons.length; i++){
            this.menbers[i] = new Person(persons[i],this.monthUtil);
        }
        var menbersC = [];
        for(var i = 0; i < this.menbers.length; i++ ){
            var menber = this.menbers[i];
            if(menber.type == "C"){
                menbersC.push(menber);
            } else {
                menber.setSchedule(this.monthUtil);
            }
        }
        this.menbersC = menbersC;
    },
    setSchedule: function(){ // 设置type为C的员工的班表
        for(var i = 0; i < this.menbers.length; i++){
            this.menbers[i].setSchedule();
        }
        var menbers = this.menbersC;
        var monthUtil = this.monthUtil;
        var jobs = this.jobs;
        var joblen = jobs.length;
        /*设置job1*/
        function setFirstJob(menbers,i){
            if(setFirstJob.times == 0){
                for( var j = 0; j < menbers.length; j++ ){
                    if(menbers[j].table[i] == 1){
                        setFirstJob.times = 0;
                        return j;
                    }
                }
            }
            setFirstJob.times++;
            if(setFirstJob.times>10){setFirstJob.times = 0;return -1;}
            var random = Math.floor(Math.random()*1000)%menbers.length;
            if(menbers[random].table[i]!=-1&&menbers[random].table[i]!=1){
                setFirstJob(menbers,i);
            }else{
                menbers[random].table[i] = 1;
                setFirstJob.times = 0;
                return random;
            }
        }
        setFirstJob.times = 0;
        for( i = 0; i < monthUtil.monthLength; i++){
            if(setFirstJob(menbers,i) == -1){
                console.log('arrange job1 fail!');
            }
        }
        this.updateStat();//更新每个人的岗位信息
        /*设置休息日*/
        /*难点 todo */
        function setHoliday(menbers,i){
            menbers.sort(function (a, b) {
                return a.stat[jobs[0]] - b.stat[jobs[0]];
            });
            for(var j = 0; j < menbers.length; j++){
                var person = menbers[j];
                if(person.table[i] > -1) continue;
                var p = (person.holiday - (person.stat[jobs[0]]||0))*1.5/ (person.table.length - i -1);
                var random = Math.random() < p ? true:false;
                if(random){
                    person.table[i] = 0;
                }
            }
        }
        for( i = 0; i < monthUtil.monthLength; i++){
            setHoliday(menbers,i);
            this.updateStat();//更新每个人的岗位信息
        }
        /*设置剩余岗位 todo */
        function setRestDay(menbers,i){
            for(var j = 2; j < jobs.length; j++){
                var flag = false;
                var restPersons = [];
                for(var k = 0; k < menbers.length; k++){
                    if(menbers[k].table[i] == j){
                        flag = true;
                    }
                    if(menbers[k].table[i] == -1){
                        restPersons.push(menbers[k]);
                    }
                }
                if(flag || restPersons.length == 0){break}
                restPersons.sort(function(a,b){
                    return a.stat[jobs[j]] - b.stat[jobs[j]];
                });
                var random = Math.floor(Math.random()*1000)%restPersons.length;
                restPersons[random].table[i] = j;
            }
        }
        for( i = 0; i < monthUtil.monthLength; i++){
            setRestDay(menbers,i);
            this.updateStat();//更新每个人的岗位信息
        }
        /*设置剩余岗位*/
        function setBlankDay(menbers){
            for(var i = 0; i < menbers.length; i++){
                var person = menbers[i];
                for(var j = 0; j < monthUtil.monthLength; j++){
                    if(person.table[j] == -1){
                        person.table[j] = jobs.length-1;
                    }
                }
            }
        }
        setBlankDay(menbers);
    },
    updateStat:function(flag){
        if(flag){
            this.menbers.forEach(function(element, index, array){
                element.computeStat();
            })
        }else{
            this.menbersC.forEach(function(element, index, array){
                element.computeStat();
            })
        }
    },
    print: function () {
        var jobs = this.jobs;
        var html = '<table><tr><th>日 期</th>',
            str = '<tr><th>星期</th>',
            weeks = ['日','一','二','三','四','五','六'];

        for(var i = 0; i < this.monthUtil.monthLength; i++){
            html += '<th>'+ (i+1) +'日</th>';
            str += '<th>周'+ weeks[(i + monthUtil.firstDay)%7] +'</th>';
        }
        for( i = 0; i < jobs.length; i++ ){
            html += '<th>'+ jobs[i] +'</th>';
        }
        html += '</tr>'+ str+ '</tr>';
        for(i = 0; i < this.menbers.length; i++ ){
            var person = this.menbers[i];
            var str = '<tr><th>'+person.name+'</th>';
            for( var j = 0; j < person.table.length; j++ ){
                str += '<td>'+(jobs[person.table[j]]||'')+'</td>'
            }
            for( var j = 0; j < jobs.length; j++ ){
                str += '<td>'+ (person.stat[jobs[j]]||0) +'</td>';
            }
            str += '</tr>';
            html += str;
        }
        html += '</table>';
        document.write(html);
    }
};
/*test*/
var teamSetting = {
    jobs:["休","岗1","岗2","岗3","岗4"],
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
    ],
    monthUtil:monthUtil
};
var team = new Team(teamSetting);
team.setSchedule();
team.print();
console.log(team);
