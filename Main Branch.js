studentApp.controller("studentHistoryController",['$scope','$rootScope','$window','$http', '$location','$stateParams','$state', function ($scope,$rootScope,$window,$http, $location,$stateParams,$state) {
    $rootScope.page_header = "Student Assessment Details";
    $scope.course =  $stateParams.course;
    $scope.grade = $stateParams.grade;
    $scope.classId = $stateParams.class;
    $scope.className = $stateParams.className;
    $scope.classStartDate = $stateParams.classStartDate;
    $scope.classEndDate = $stateParams.classEndDate;
    $scope.testId = $stateParams.testId;
    $scope.fullName = $stateParams.fullName;
    $scope.userID = $stateParams.userID;
    $scope.testStart = $stateParams.testStart;
    $scope.category = $stateParams.category;

    $http.post('/strands').then(function (data) {
        if(data.data){
            $scope.colorsTemp = data.data.data;
            // console.log("$scope.colorsTemp", $scope.colorsTemp);
            $scope.get_strands();

        }
    });

    $scope.get_strands = function(){
        console.log("Entered into get_strands ---");

        if(($scope.course) && ($scope.grade)){

            $http.post('/get_strand',{
                course : $scope.course,
                grade : $scope.grade
            }).then(function (data) {
                // console.log("starnds", data.data.data);
                if(data.data.data.length > 0){
                    var strands = data.data.data;

                    $scope.colors = {};
                    $scope.bgcolor={};
                    // console.log("  $scope.bgcolor",  $scope.bgcolor)

                    for (var i = 0; i < strands.length; i++) {

                        for (var keys in $scope.colorsTemp) {
                            if (keys == strands[i].strand) {
                                $scope.colors[keys] = $scope.colorsTemp[keys].color;
                            }
                        }

                    }
                    $scope.getStudentStrands();
                }
                else {
                    return;
                }
            });

        }else{
            return;
        }
    }


    $scope.getStudentStrands = function(){
        if(($scope.userID) && ($scope.testId)) {
            var requesObj = {
                userID: $scope.userID,
                startdate: $scope.classStartDate,
                enddate: $scope.classEndDate,
                testid: $scope.testId
            };
            console.log("requesObj", requesObj);
            $http.post('/get_stu3strand', requesObj).then(function (data) {
                console.log("%%%%%%%%", data);
                if(data.data.data){
                    $scope.bgcolor = {};
                    var strandScore = data.data.data;
                    console.log(strandScore, "strandScore ----");
                    for (var i in strandScore) {

                        if (strandScore[i].testID == $scope.testId) {
                            $scope.studentScore = strandScore[i].totalscore;
                            $scope.assessmentName = strandScore[i].assessmentName ? strandScore[i].assessmentName : null;

                            $scope.results = [];
                            var k = 0;

                            // $scope.startstr = moment($scope.stdate).format("MMMM DD") + "," + strandscore[i].resultdate.split(" ")[0].split("-")[0];
                            for (var element in $scope.colors) {
                                for (var keys in strandScore[i]) {
                                    if (strandScore[i][keys] == element) {
                                        var scorekey = keys.substring(10, 11);
                                        // console.log(scorekey, "scorekey ---");
                                        $scope.results[k] = {};
                                        // $scope.results[0].strandname = "Patterning & Algebra";
                                        $scope.results[k].strandname = element;
                                        $scope.results[k].color = $scope.colors[element];
                                        $scope.results[k].percentage = strandScore[i]["strandscore" + scorekey];
                                        $scope.bgcolor[k + 1] = $scope.colorsTemp[element].backgroundColor;
                                        k++;
                                    }

                                }
                            }

                        }

                    }
                    $scope.testQuestionData();

                }
                else{
                    return;
                }

            });
        }else{
            return;
        }


    }

    // $scope.trackByFn = function(index, item){
    //     return index;
    // }

    $scope.testQuestionData = function(){
        console.log("Entered into testQuestionData ---");
        var reqObj = {
            userID : $scope.userID,
            testid :   $scope.testId
        };
        $http.post('/get_stu3testID',reqObj).then(function (data) {
            // console.log("/get_stu3testID ---", data);
            if (data.data.data) {
                $scope.transactiontabledatabkp = data.data.data;
                $scope.transactiontabledata = data.data.data;
                $scope.questiontabledata = data.data.data;

                for(var i=0; i < $scope.results.length; i++)
                {
                    if ($scope.results[i].percentage != undefined && $scope.results[i].percentage >= 0) {
                        $scope.strandselect($scope.results[i].strandname, $scope.results[i].percentage,i);
                        break;
                    }
                }

            }
        });

    };


    $scope.strandselect = function(strand, score, index) {
        $scope.activeMenu = strand;
        $scope.tabs= index + 1;
        $scope.que = false;
        // $scope.question1.student = undefined;
        $scope.transactiontable = [];
        var p = 0;
        for (var i = 0; i < $scope.transactiontabledatabkp.length; i++) {
            if ($scope.transactiontabledatabkp[i].strand == strand) {
                $scope.transactiontable[p] = $scope.transactiontabledatabkp[i];
                p++;
            }
        }
        $scope.transactiontabledata = $scope.transactiontable;
        // console.log("transactiontabledata ",$scope.transactiontabledata);

    };

    $scope.question1 = {};

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.selected_question = function(questions,index ) {
        console.log("Entered into selected_question ---");
        $scope.selectedQuestion = index;
        //alert("selected question:"+JSON.stringify(questions));
        $scope.safeApply(function() {

            for (var i = 0; i < $scope.questiontabledata.length; i++) {
                if ($scope.questiontabledata[i].questionID == questions) {
                    $scope.question1.student = $scope.questiontabledata[i];
                }
            }
            console.log($scope.question1.student.type, "$scope.question1.student.type ---");

            if($scope.question1.student.type == 'open') {
                var imageName = $scope.question1.student.attachment;
            }else if($scope.question1.student.type == 'text') {
                var imageName = $scope.question1.student.attachment;

            }else{
                var imageName = $scope.question1.student.response;
            }

            // console.log(imageName, "$scope.question1.student.response --");

            // var imageName = $scope.question1.student.response;
            if(imageName != 'undefined' && imageName != undefined && imageName != null) {
                if (imageName.match(/\.(jpeg|jpg|png)$/) != null) {
                    $scope.imageShow = true;
                    $scope.textShow = false;  // abc.jpg no need to show
                }
                else {
                    $scope.imageShow = false;
                    $scope.textShow = true;
                }
            }


        });

        $scope.que = true;
    };


    //display popup with image
    setTimeout(function() {
        $(".ui-dialog[aria-describedby='dialog-modal-img']").remove();
        $scope.awsimgdialog = false;
        $scope.imgnotexist = false;
        $("#dialog-modal-img").dialog({
            autoOpen: false,
            modal: true,
            position:{my: "top",at: "top"},
            dialogClass: "responsive_dailog",
            width:1000,
            height: 600,
            responsive: true,
            closeText: ''
        });
    }, 500);

    $scope.displayModalForImage = function(question,attachment){
        document.getElementById("awsImg").src='';
        console.log(question,attachment);
        var imageName =attachment;
        $scope.awsimgdialog = true;

        if(imageName == ''){
            $('#awsImg').css({
                "padding-top":"30%","padding-left":"3%"
            })

            $scope.awsimgdialog = true;
            $scope.imgnotexist = true;
            // $scope.imgnotexist = true;
            document.getElementById("awsImg").src = "https://s3.amazonaws.com/neolearningsystem/721269d0-ec8e-11e7-ac5f-ed938f07eb62.png";
            $("#dialog-modal-img").dialog("open");
        }else {
            $('#awsImg').css({
                "padding-top":"0%","padding-left":"0%"
            })
            $scope.imgnotexist = false;
            var urlimg = "https://s3.amazonaws.com/neolearningsystem/student/"+imageName;
            document.getElementById("awsImg").src = urlimg;
            $("#dialog-modal-img").dialog("open");
        };

    };




}]);