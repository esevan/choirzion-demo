'use strict';

angular.module('myApp.main', [ 'ngRoute' ])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/main', {
		templateUrl : 'view/main/main.html',
		controller : 'MainCtrl'
	});
} ])

.controller('MainCtrl', [ '$scope', '$rootScope', function($scope, $rootScope) {
	var init = function() {
		selectMenu(0); /* 메뉴 선택 */
	};

	init();
} ]);