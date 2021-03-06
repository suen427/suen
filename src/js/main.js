// tab, data-tab-target直接使用css选择器
function tabClickHandler(e){
    var $this = $(e.target);
    if($this.is('ul.tab > li:not(.active)')){
        var thisTarget = $this.data('tabTarget');
        var $currentActive = $this.siblings('li.active');
        var currentTarget = $currentActive.data('tabTarget');
        $currentActive.removeClass('active');
        $(currentTarget).hide();
        $this.addClass('active');
        $(thisTarget).show();
    }
}
// 需要在捕获阶段就执行,避免echarts在tab的click事件中执行时依然无法获取元素高宽
document.body.addEventListener('click', tabClickHandler, true);

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
        this.tableA = tableA.slice(this.firstDay,this.firstDay+this.monthLength);
        this.tableB = tableB.slice(this.firstDay,this.firstDay+this.monthLength);
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
/*var settings = {
    //monthNum:1,// 获得下月日期对象，monthNum是月份数字0、1、2...11
    workDayNum:24 // 一个月中的工作天数
};
var monthUtil = new MonthUtil(settings);
console.log(monthUtil);*/
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
            if(settings.preArr){
                this.setPre(settings.preArr);
            }
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
        },
        setRest: function (monthUtil,i) {
            /*
            *
            * return 0 表示不休息
            *        1 表示休息一天
            *        2 表示单日和当日的后一日休息
            * */
            var firstSatday = monthUtil.firstSatday-1,
                firstSunday = monthUtil.firstSunday-1,
                firstDay = monthUtil.firstDay,
                firstMonday = (firstSunday+1)% 7,
                type = i <= 1 ? 1 :(   i < this.table.length-2 ? 2 : 3   ),
                p = (this.holiday - (this.stat[this.jobs[0]]||0))/ (this.table.length - i -1),
                nearRestFlag = false, // 前后4天是否有休息
                berforeDaytFlag = false,
                nextDaytFlag = false,
                berfore2DaytFlag = false,
                next2DaytFlag = false,
                longWorkFlag = true,
                weekendCoef = 2.4,
                satdayCoef = 3,
                longWorkCoef = 0.9;
            if ( this.holiday >= 7 ){
                weekendCoef = 2.8;
                satdayCoef = 4;
            }
            var start = Math.max(i-3,0),
                end = Math.min(this.table.length-1, i+3);
            for ( var j = start; j < end; ++j ){
                if ( j > i-2 && j < i+2){
                    continue;
                }
                if ( this.table[j] === 0 ){
                    nearRestFlag = true;
                    break;
                }
            }
            if (i > 0){
                if (this.table[i-1] === 0){
                    berforeDaytFlag  = true;
                }
            }
            if (i < this.table.length - 1){
                if (this.table[i+1] === 0){
                    nextDaytFlag  = true;
                }
            }
            if (berforeDaytFlag && i > 1 ){
                if ( this.table[i-2] === 0 ){
                    berfore2DaytFlag =true;
                }
            }
            if (nextDaytFlag && i < this.table.length - 2 ){
                if ( this.table[i+2] === 0 ){
                    next2DaytFlag =true;
                }
            }
            if ( i > 6 ){
                for ( j = i - 6; j < i ; ++j ){
                    if ( this.table[j] == 0 ){
                        longWorkFlag = false;
                        break;
                    }
                }
            } else {
                longWorkFlag = false;
            }

            if ( nearRestFlag || berfore2DaytFlag || next2DaytFlag ){
                return 0;
            }
            if ( berforeDaytFlag && nextDaytFlag ){
                return 0;
            }
            if ( i == 0) {
                return 0;
            }

            if ( longWorkFlag && (this.holiday - (this.stat[this.jobs[0]] || 0)) > 0 ) {
                p = longWorkCoef;
            }

            if( type === 2 ) {
                if (!berforeDaytFlag) {
                    if (i % 7 === firstSatday && (this.holiday - (this.stat[this.jobs[0]] || 0)) >= 2 && this.table[i + 1] === -1) {
                        if (Math.random() * satdayCoef > 1) {
                            return 2;
                        }
                    }
                }
            }
            if( i%7 == firstSatday || i%7 == firstSunday ){
                p = p*weekendCoef;
            }
            if ( i%7 == firstMonday ){
                p = 0;
            }
            if ( p > Math.random()){
                return 1;
            }
            return 0;
        },
        polishHoliday: function () {
            this.callTime = this.callTime + 1 || 0;
            if( this.callTime > 10 ) {
                alert('请在试一次！');
                return fales;;
            }
            var longest = this.longestWork();
            if ( longest[0] > 7 ){
                if (this.table[longest[1]+3] == -1 && this.table[longest[1]+2] !== 0 && this.table[longest[1]+4] !== 0){
                    this.table[longest[1]+3] = 0;
                } else if ( this.table[longest[1]+4] == -1  && this.table[longest[1]+3] !== 0 && this.table[longest[1]+5] !== 0 ){
                    this.table[longest[1]+4] = 0;
                }else {
                    var sr = this.singleRest();
                    if ( sr.length>0){
                        this.table[ sr[ Math.floor( Math.random()*10 ) % sr.length ]+1 ] = 0;
                    } else {
                        for ( var k = 1; k < this.table.length-1; ++k){
                            if ( this.table[k-1] !==0 && this.table[k+1] !==0 && this.table[k] === -1 ){
                                this.table[k] = 0;
                                break;
                            }
                        }
                    }
                }
            } else {
                var sr = this.singleRest();
                if ( sr.length>0 ){
                    this.table[ sr[ Math.floor( Math.random()*10 ) % sr.length ]+1 ] = 0;
                } else {
                    for ( var k = 1; k < this.table.length-1; ++k){
                        if ( this.table[k-1] !==0 && this.table[k+1] !==0 && this.table[k] === -1 ){
                            this.table[k] = 0;
                            break;
                        }
                    }
                }
            }
            this.computeStat();
            if ( this.holiday > (this.stat[this.jobs[0]] || 0) ) {
                this.polishHoliday();
            } else {
                this.callTime = 0;
            }
        },
        longestWork: function () {
            var longest = 0,
                longestPosition = 0,
                current = 0;// 当前的连续工作日长度
            for( var j = 0; j < this.table.length; ++j ){
                if ( this.table[j] !== 0){
                    current++;
                }
                else if ( current > longest ) {
                    longest = current;
                    longestPosition = j - current;
                    current = 0;
                }
            }
            return [longest,longestPosition];
        },
        singleRest: function () {
            var sr = [];
            for ( var j = 1; j < this.table.length -1; ++j ){
                if ( this.table[j] === 0 && this.table[j-1] === -1 && this.table[j+1] === -1 ){
                    sr.push(j);
                }
            }
            return sr;
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
        this.getPreSetting('table');
        for(var i = 0; i < this.menbers.length; i++){
            this.menbers[i].setSchedule();
        }
        var menbers = this.menbersC;
        var monthUtil = this.monthUtil;
        var jobs = this.jobs;
        var joblen = jobs.length;
        /*设置job1*/
        function setFirstJob(menbers,i){
            var job1Menbers = [];
            if(setFirstJob.times == 0){
                for( var j = 0; j < menbers.length; j++ ){
                    if(menbers[j].table[i] == 1){
                        setFirstJob.times = 0;
                        return j;
                    }
                    if( (menbers[j].stat[jobs[1]]||0) < (monthUtil.monthLength/ menbers.length ) ){
                        job1Menbers.push(menbers[j]);
                    }
                }
            }
            if(job1Menbers.length == 0 ) { setFirstJob.times = 0;return -1 }
            setFirstJob.times++;
            if(setFirstJob.times>10){setFirstJob.times = 0;return -1;}
            var random = Math.floor(Math.random()*1000)%job1Menbers.length;
            if(job1Menbers[random].table[i]!=-1&&job1Menbers[random].table[i]!=1){
                setFirstJob(job1Menbers,i);
            }else{
                job1Menbers[random].table[i] = 1;
                job1Menbers[random].computeStat();
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
        function setHoliday(menbers,i){
            menbers.sort(function (a, b) {
                return a.stat[jobs[0]] - b.stat[jobs[0]];
            });
            var firstSatday = monthUtil.firstSatday,
                firstSunday = monthUtil.firstSunday,
                firstDay = monthUtil.firstDay;
            for(var j = 0; j < menbers.length; j++){
                var person = menbers[j];
                if(person.table[i] > -1) continue;
                var rest = person.setRest(monthUtil,i);
                if (rest === 1){
                    person.table[i] = 0
                } else if ( rest === 2 ){
                    person.table[i] = 0;
                    person.table[i+1] = 0;
                }
            }
        }
        for( i = 0; i < monthUtil.monthLength; i++){
            setHoliday(menbers,i);
            this.updateStat();//更新每个人的岗位信息
        }
        /*补齐剩余休息日*/
        for( j = 0; j < menbers.length; j++){
            var person = menbers[j];
            if ( person.holiday > (person.stat[jobs[0]] || 0) ){
                person.polishHoliday();
            }
        }

        /*设置剩余岗位*/
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
    print: function (id) {
        var jobs = this.jobs;
        var html = '<thead><tr><th>日 期</th>',
            str = '<tr><th>星期</th>',
            weeks = ['日','一','二','三','四','五','六'];

        for(var i = 0; i < this.monthUtil.monthLength; i++){
            html += '<th>'+ (i+1) +'日</th>';
            str += '<th>周'+ weeks[(i + monthUtil.firstDay)%7] +'</th>';
        }
        for( i = 0; i < jobs.length; i++ ){
            html += '<th rowspan="2">'+ jobs[i] +'</th>';
        }
        html += '</tr>'+ str+ '</tr></thead>';
        for(i = 0; i < this.menbers.length; i++ ){
            var person = this.menbers[i];
            str = '<tr class="'+ person.type +'"><th>'+person.name+'</th>';
            for( var j = 0; j < person.table.length; j++ ){
                if( person.table[j]==0 ){
                    str += '<td class="rest">'+(jobs[person.table[j]]||'')+'</td>'
                } else {
                    str += '<td>'+(jobs[person.table[j]]||'')+'</td>'
                }
            }
            for( var j = 0; j < jobs.length; j++ ){
                str += '<td>'+ (person.stat[jobs[j]]||0) +'</td>';
            }
            str += '</tr>';
            html += str;
        }
        document.getElementById(id).innerHTML = html;
    },
    printBlankTable: function (id) {
        var jobs = this.jobs;
        var html = '<thead><tr><th>日 期</th>',
            str = '<tr><th>星期</th>',
            weeks = ['日','一','二','三','四','五','六'];
        for(var i = 0; i < this.monthUtil.monthLength; i++){
            html += '<th>'+ (i+1) +'日</th>';
            str += '<th>周'+ weeks[(i + monthUtil.firstDay)%7] +'</th>';
        }
        for( i = 0; i < jobs.length; i++ ){
            html += '<th rowspan="2">'+ jobs[i] +'</th>';
        }
        html += '</tr>'+ str+ '</tr></thead>';
        for(i = 0; i < this.menbers.length; i++ ){
            var person = this.menbers[i];
            str = '<tr class="'+ person.type +'"><th>'+person.name+'</th>';
            for( var j = 0; j < person.table.length; j++ ){
                str += '<td></td>'
            }
            for( var j = 0; j < jobs.length; j++ ){
                str += '<td></td>';
            }
            str += '</tr>';
            html += str;
        }
        var table =  document.getElementById(id);
        table.innerHTML = html;
        document.addEventListener('click', function (e) {
            var target = e.target;
            if(target.nodeName.toLowerCase() === 'li' ){
                var p = target.parentNode;
                if(p.className.indexOf('select-down')>-1 ){
                    var pp = p.parentNode;
                    pp.innerHTML = target.innerHTML;
                    pp.className = 'changed';
                }
            }

            var selectDown = document.getElementsByClassName('select-down');
            for( var i = 0; i < selectDown.length; ++i ){
                selectDown[i].parentNode.removeChild(selectDown[i]);
            }

            if(target.nodeName.toLowerCase() === 'td'){
                if( target.parentNode.className.indexOf('C')>-1 ) {
                    var html = '<ul class="select-down">';
                    for ( var k = 0; k < jobs.length; ++k ){
                        html += '<li>'+jobs[k] + '</li>';
                    }
                    html += '</ul>';
                } else {
                    var html = '<ul class="select-down"><li>休</li><li>岗1</li></ul>';
                }
                target.innerHTML = target.innerHTML+html;
            }
        });
    },
    getPreSetting: function (id) {
        var jobs = this.jobs;
        var menbers = this.menbers;
        var table = document.getElementById(id);
        var trs = table.getElementsByTagName('tr');
        if( trs.length < 2  ){return}
        var names = [];
        var name = '';
        for( var i = 2; i < trs.length; ++i ){
            name = trs[i].getElementsByTagName('th')[0].innerHTML;
            names.push(name);
        }
        var person = null;
        var tds = null;
        for ( i = 0; i < menbers.length; ++i ){
            person = menbers[i];
            tds = trs[names.indexOf(person.name)+2].getElementsByTagName('td');
            for ( var j = 0; j < person.table.length; ++j ){
                if( jobs.indexOf(tds[j+1].innerHTML)>-1){
                    person.table[j] = jobs.indexOf( tds[j+1].innerHTML );
                }
            }
        }
    }
};

/*test*/
var settings = {
    monthNum:4,// 获得下月日期对象，monthNum是月份数字0、1、2...11
    workDayNum:24 // 一个月中的工作天数
};
var monthUtil = new MonthUtil(settings);
var teamSetting = {
    jobs:["休","岗1","岗2","岗3","岗4"],
    persons:[
        {name:"戎超群",type:"C",
            preArr:[0,-1,-1,-1,-1,4,-1,
                -1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1
            ]
        },
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

//team.printBlankTable('table');
team.setSchedule();
team.print('table');
