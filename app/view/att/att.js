// Generated by CoffeeScript 1.10.0
(function() {
  var angularModule;

  angularModule = angular.module("myApp.att", ["ngRoute"]);

  angularModule.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/att", {
        templateUrl: "view/att/att.html",
        controller: "AttCtrl"
      }).when("/att/regist", {
        templateUrl: "view/att/attRegist.html",
        controller: "AttRegistCtrl"
      }).when("/att/:practiceDt/:practiceCd", {
        templateUrl: "view/att/attDetail.html",
        controller: "AttDetailCtrl"
      });
    }
  ]);

  angularModule.factory("AttSvc", [
    "$http", function($http) {
      return {
        getAttList: function(page) {
          return $http.get(("/rest/att/list/" + page + "?t=") + new Date());
        },
        save: function(pDt, pCd, musicInfo, etcMsg) {
          return $http.post("/rest/att/" + pDt + "/" + pCd, {
            musicInfo: musicInfo,
            etcMsg: etcMsg
          });
        },
        remove: function(pDt, pCd) {
          return $http["delete"]("/rest/att/" + pDt + "/" + pCd);
        },
        getDetail: function(pDt, pCd) {
          return $http.get(("/rest/att/" + pDt + "/" + pCd + "?t=") + new Date());
        },
        saveMusicInfo: function(pDt, pCd, musicInfo) {
          return $http.put("/rest/att/" + pDt + "/" + pCd + "/musicInfo", {
            musicInfo: musicInfo
          });
        },
        saveEtcMsg: function(pDt, pCd, etcMsg) {
          return $http.put("/rest/att/" + pDt + "/" + pCd + "/etcMsg", {
            etcMsg: etcMsg
          });
        },
        select: function(pDt, pCd, memberId, attYn) {
          switch (attYn) {
            case "Y":
              return $http.post("/rest/att/" + pDt + "/" + pCd + "/deselect", {
                memberId: memberId
              });
            case "N":
              return $http.post("/rest/att/" + pDt + "/" + pCd + "/select", {
                memberId: memberId
              });
          }
        },
        lockAtt: function(pDt, pCd) {
          return $http.put("/rest/att/" + pDt + "/" + pCd + "/lockAtt");
        },
        unlockAtt: function(pDt, pCd) {
          return $http.put("/rest/att/" + pDt + "/" + pCd + "/unlockAtt");
        }
      };
    }
  ]);

  angularModule.factory("socket", function($rootScope) {
    var socket;
    socket = io.connect();
    return {
      on: function(eventName, callback) {
        return socket.on(eventName, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            if (callback) {
              return callback.apply(socket, args);
            }
          });
        });
      },
      removeAllListeners: function() {
        return socket.removeAllListeners();
      }
    };
  });

  angularModule.controller("AttCtrl", [
    '$scope', '$rootScope', 'AttSvc', '$location', 'socket', '$route', function($scope, $rootScope, AttSvc, $location, socket, $route) {
      var init, p;
      $scope.$on("$destroy", function() {
        return socket.removeAllListeners();
      });
      socket.emit("hallJoin");
      socket.on("refreshPage", function(data) {
        $route.reload();
        return $.notify(data);
      });
      $scope.mock = true;
      $rootScope.backdrop = 'backdrop';
      init = function() {
        return selectMenu(2);
      };
      init();
      p = 2;
      $scope.more = function() {
        $rootScope.backdrop = 'backdrop';
        return AttSvc.getAttList(p).success(function(data) {
          var i, j, len;
          if (data !== null && data.length > 0) {
            if ((data.length === 50)($scope.needMoreButton = true)) {

            } else {
              $scope.needMoreButton = false;
            }
            for (j = 0, len = data.length; j < len; j++) {
              i = data[j];
              $scope.attList.push(data[i]);
            }
            p++;
          }
          return $rootScope.backdrop = void 0;
        });
      };
      $scope.regist = function() {
        return $location.path("/att/regist");
      };
      AttSvc.getAttList(1).success(function(data) {
        if (data.length === 50) {
          $scope.needMoreButton = true;
        } else {
          $scope.needMoreButton = false;
        }
        $scope.attList = data;
        $scope.mock = false;
        return $rootScope.backdrop = void 0;
      });
      return $scope.detail = function(att) {
        return $location.path("/att/" + att.practiceDt + "/" + att.practiceCd);
      };
    }
  ]);

  angularModule.controller("AttRegistCtrl", [
    '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', 'socket', function($scope, $rootScope, AttSvc, $location, CodeSvc, $q, socket) {
      var init;
      $scope.$on("$destroy", function() {
        return socket.removeAllListeners();
      });
      $rootScope.backdrop = 'backdrop';
      init = function() {
        return selectMenu(2);
      };
      init();
      $(function() {
        moment.locale("ko", {
          week: {
            dow: 1
          }
        });
        return $('#datetimepicker').datetimepicker({
          format: "L"
        }).on("dp.change", function(e) {
          return $scope.$apply(function() {
            return $scope.att.practiceDt = moment(e.date).format("YYYY-MM-DD");
          });
        });
      });
      return $q.all([CodeSvc.getCodeList()]).then(function(resultArray) {
        var idx;
        $scope.code = resultArray[0].data;
        $rootScope.backdrop = void 0;
        $scope.att = new Object();
        idx = 0;
        if (moment().days() === 0 && new Date().getHours() <= 12) {
          idx = 0;
        } else if (moment().days() === 0 && new Date().getHours() > 12) {
          idx = 1;
        } else {
          idx = 2;
        }
        $scope.att.practiceCd = $scope.code.practiceList[idx].PRACTICE_CD;
        $scope.att.practiceNm = $scope.code.practiceList[idx].PRACTICE_NM;
        $scope.att.practiceDt = moment().format("YYYY-MM-DD");
        $rootScope.backdrop = void 0;
        $scope.gotoAttList = function() {
          return $location.path('/att');
        };
        return $scope.save = function(pDt, pCd, musicInfo, etcMsg) {
          if ($scope.attForm.$invalid) {
            return $.notify("날짜를 형식(YYYY-MM-DD)에 맞게 선택/입력해주세요.");
          } else {
            $rootScope.backdrop = 'backdrop';
            return AttSvc.save(pDt, pCd, musicInfo, etcMsg).success(function(data) {
              if (data.result === 'success') {
                socket.emit('addAtt');
                $location.path('/att');
              } else if (data.result === 'dup') {
                $.notify('이미 생성된 연습정보가 있습니다.');
                $location.path('/att');
              }
              return $rootScope.backdrop = void 0;
            });
          }
        };
      });
    }
  ]);

  angularModule.controller("AttDetailCtrl", [
    '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', '$routeParams', 'socket', function($scope, $rootScope, AttSvc, $location, CodeSvc, $q, $routeParams, socket) {
      var attDataLoad, init;
      $rootScope.backdrop = 'backdrop';
      init = function() {
        return selectMenu(2);
      };
      init();
      $scope.$on('$destroy', function() {
        return socket.removeAllListeners();
      });
      socket.emit("join", $routeParams.practiceDt + $routeParams.practiceCd);
      socket.on("replaceMusicInfo", function(data) {
        $scope.att.musicInfo = data;
        return $.notify("연습곡 정보가 갱신되었습니다.");
      });
      socket.on("backToList", function() {
        $.notify("연습정보가 삭제되었습니다.");
        return $location.path("/att");
      });
      socket.on("refreshPage", function(data) {
        $rootScope.backdrop = "backdrop";
        $.notify(data);
        return attDataLoad();
      });
      socket.on("replaceEtcMsg", function(data) {
        $scope.att.etcMsg = data;
        return $.notify("메모가 갱신되었습니다.");
      });
      socket.on("select", function(data) {
        return $scope.sList.concat($scope.aList).concat($scope.tList).concat($scope.bList).concat($scope.eList).concat($scope.hList).concat($scope.xList).forEach(function(m) {
          if (m.memberId === data.memberId) {
            if (data.attYn === 'Y') {
              m.attYn = "N";
            } else {
              m.attYn = "Y";
            }
            return false;
          }
        });
      });
      attDataLoad = function() {
        return $q.all([CodeSvc.getCodeList(), AttSvc.getDetail($routeParams.practiceDt, $routeParams.practiceCd)]).then(function(resultArray) {
          $scope.code = resultArray[0].data;
          $scope.att = resultArray[1].data.attInfo;
          $scope.sList = resultArray[1].data.s;
          $scope.aList = resultArray[1].data.a;
          $scope.tList = resultArray[1].data.t;
          $scope.bList = resultArray[1].data.b;
          $scope.eList = resultArray[1].data.e;
          $scope.hList = resultArray[1].data.h;
          $scope.xList = resultArray[1].data.x;
          if (!$scope.att) {
            $.notify("존재하지 않는 연습정보입니다.");
            $location.path("/att");
          }
          return $rootScope.backdrop = void 0;
        });
      };
      attDataLoad();
      $scope.gotoAttList = function() {
        return $location.path("/att");
      };
      $scope.remove = function(pDt, pCd) {
        bootbox.dialog({
          message: "연습정보 및 출석정보를 정말로 삭제하시겠습니까?",
          title: "<i class='ion-android-alert'></i> 삭제 확인",
          buttons: {
            danger: {
              label: "삭제",
              className: "btn-danger",
              callback: function() {
                $rootScope.backdrop = 'backdrop';
                return AttSvc.remove(pDt, pCd).success(function(data) {
                  $rootScope.backdrop = void 0;
                  $location.path("/att");
                  return socket.emit("removeAtt");
                });
              }
            },
            main: {
              label: "취소",
              className: "btn-default",
              callback: function() {}
            }
          }
        });
        return true;
      };
      $scope.saveMusicInfo = function(pDt, pCd, musicInfo) {
        $rootScope.backdrop = 'backdrop';
        return AttSvc.saveMusicInfo(pDt, pCd, musicInfo).success(function(data) {
          if (data.result === 'success') {
            socket.emit("refreshMusicInfo", musicInfo);
          } else {
            $.notify("'저장에 실패하였습니다.");
          }
          return $rootScope.backdrop = void 0;
        });
      };
      $scope.saveEtcMsg = function(pDt, pCd, etcMsg) {
        $rootScope.backdrop = 'backdrop';
        return AttSvc.saveEtcMsg(pDt, pCd, etcMsg).success(function(data) {
          if (data.result === 'success') {
            socket.emit("refreshEtcMsg", etcMsg);
          } else {
            $.notify("저장에 실패하였습니다.");
          }
          return $rootScope.backdrop = void 0;
        });
      };
      $scope.lockAtt = function(pDt, pCd) {
        bootbox.dialog({
          message: "연습정보 및 출석정보를 정말로 마감 하시겠습니까? 마감된 연습정보는 수정하실 수 없습니다.",
          title: "<i class='ion-android-alert'></i> 마감 확인",
          buttons: {
            danger: {
              label: "마감",
              className: "btn-success",
              callback: function() {
                $rootScope.backdrop = 'backdrop';
                return AttSvc.lockAtt(pDt, pCd).success(function(data) {
                  $rootScope.backdrop = void 0;
                  return socket.emit("closeAtt");
                });
              }
            },
            main: {
              label: "취소",
              className: "btn-default",
              callback: function() {}
            }
          }
        });
        return true;
      };
      $scope.unlockAtt = function(pDt, pCd) {
        bootbox.dialog({
          message: "연습정보 및 출석정보를 정말로 마감 해제 하시겠습니까?",
          title: "<i class='ion-android-alert'></i> 마감 해제 확인",
          buttons: {
            danger: {
              label: "마감 해제",
              className: "btn-success",
              callback: function() {
                $rootScope.backdrop = 'backdrop';
                return AttSvc.unlockAtt(pDt, pCd).success(function(data) {
                  $rootScope.backdrop = void 0;
                  return socket.emit("uncloseAtt");
                });
              }
            },
            main: {
              label: "취소",
              className: "btn-default",
              callback: function() {}
            }
          }
        });
        return true;
      };
      return $scope.select = function(pDt, pCd, memberId, lockYn, attYn, partCd) {
        if (lockYn === 'N') {
          $rootScope.backdrop = 'backdrop';
          return AttSvc.select(pDt, pCd, memberId, attYn).success(function(data) {
            var params;
            if (data.result === 'success') {
              params = new Object();
              params.pDt = pDt;
              params.pCd = pCd;
              params.memberId = memberId;
              params.attYn = attYn;
              socket.emit("select", params);
            } else {
              $.notify('서버 오류가 발생하였습니다. 잠시 후 다시 시도 해주시기바랍니다.');
            }
            return $rootScope.backdrop = void 0;
          });
        }
      };
    }
  ]);

}).call(this);
