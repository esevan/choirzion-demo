'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	})
	.when('/att/regist', {
		templateUrl: 'view/att/attRegist.html',
		controller: 'AttRegistCtrl'
	})
	.when('/att/:practiceDt/:practiceCd', {
		templateUrl: 'view/att/attDetail.html',
		controller: 'AttDetailCtrl'
	})
	;
}])

.factory('AttSvc', ['$http','$rootScope', 
            function($http , $rootScope) {
	
	return {
		/* 연습정보 목록 */
		getAttList : function(page) {
			return $http.get('/rest/att/list/'+page);
		},
		/* 연습정보 등록 */
		save : function(att) {
			return $http.post('/rest/att', att);
		},
		/* 연습정보 삭제 */
		remove : function(pDt,pCd) {
			return $http.delete('/rest/att/'+pDt+'/'+pCd);
		},
		/* 연습정보 상세(출석정보 포함) */
		getDetail : function(pDt, pCd) {
			return $http.get('/rest/att/'+pDt+'/'+pCd);
		}
	};
}])

.controller('AttCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 
                 function($scope ,  $rootScope ,  AttSvc ,  $location) {
	
	$scope.mock = true;
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	var p=2;
	
	/* 더보기 */
	$scope.more = function() {
		$rootScope.backdrop = 'backdrop';
		AttSvc.getAttList(p).success(function(data) {
			
			if(data != null && data.length > 0) {
				for (var i in data) {$scope.attList.push(data[i]);}
				p++;
			}
			
			$rootScope.backdrop = undefined;
		});
	}
	
	/* 연습일정 추가 */
	$scope.regist = function() {
		$location.path('/att/regist');
	}
		
	AttSvc.getAttList(1).success(function(data) {
		$scope.attList = data;
		$scope.mock = false;
		$rootScope.backdrop = undefined;
	});
	
	/* 상세정보 보기 */
	$scope.detail = function(att) {
		$location.path('/att/'+att.practiceDt+'/'+att.practiceCd);
	}
	
}])

.controller('AttRegistCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q) {
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	/* 날짜선택 플러그인 적용 */
	$(function () {
		$('#datetimepicker').datetimepicker({
			format: 'L',
			locale: 'ko'
		});
    });

	/* 코드리스트 불러오기 */
	$q.all([CodeSvc.getCodeList()])
	
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		$rootScope.backdrop = undefined;
		
		$scope.att = new Object();
		
		var idx = 0;
		if(moment().days() == 0 && new Date().getHours() <= 12) idx = 0; /* 오전연습 */
		else if(moment().days() == 0 && new Date().getHours() > 12) idx = 1; /* 오후연습 */
		else idx = 2; /* 특별연습 */
		$scope.att.practiceCd = $scope.code.practiceList[idx].PRACTICE_CD;
		$scope.att.practiceNm = $scope.code.practiceList[idx].PRACTICE_NM;
		
		$scope.att.practiceDt = moment().format("YYYY-MM-DD");
		
		$rootScope.backdrop = undefined;
	});
	
	/* 연습일정 목록으로 이동 버튼*/
	$scope.gotoAttList = function() {
		$location.path('/att');
	}
	
	/* 저장 버튼*/
	$scope.save = function() {
		if($scope.attForm.$invalid) {
			$.notify('날짜를 형식(YYYY-MM-DD)에 맞게 선택/입력해주세요.');
		} else {
			
			$rootScope.backdrop = 'backdrop';
			
			AttSvc.save($scope.att).success(function(data) {
				
				$rootScope.backdrop = undefined;
				
				$location.path('/att');
				$.notify('저장되었습니다.');
			});
		}
	}
}])

.controller('AttDetailCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', '$routeParams',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  $routeParams) {
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	$q.all([CodeSvc.getCodeList(), AttSvc.getDetail($routeParams.practiceDt, $routeParams.practiceCd)])
	
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		
		$scope.att = resultArray[1].data.attInfo;
		$scope.sList = resultArray[1].data.s;
		$scope.aList = resultArray[1].data.a;
		$scope.tList = resultArray[1].data.t;
		$scope.bList = resultArray[1].data.b;
		$scope.eList = resultArray[1].data.e;
		$scope.hList = resultArray[1].data.h;
		$scope.xList = resultArray[1].data.x;
		
		$rootScope.backdrop = undefined;
	});
	
	/* 연습일정 목록으로 이동 버튼*/
	$scope.gotoAttList = function() {
		$location.path('/att');
	}
	
	/* 연습일정 삭제 */
	$scope.remove = function(pDt, pCd) {
		
		bootbox.dialog({
			message: "연습정보 및 출석정보를 정말로 삭제하시겠습니까?",
			title: "삭제 확인",
			buttons: {
				danger: {
					label: "삭제",
					className: "btn-danger",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.remove(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							$location.path('/att');
							$.notify('연습일정이 삭제되었습니다.');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-primary",
					callback: function() {
					
					}
				}
			}
		});
	}
}])
;