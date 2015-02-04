app.controller("ControllerCtrl", function($scope, $stateParams, Documentation) {
  $scope.controllerName = $stateParams.controller;
  $scope.apiVersion = $stateParams.version;

  Documentation.getController($stateParams.version, $stateParams.controller, function(response) {
    $scope.controller = _.cloneDeep(response);
  }).then(null, function() {
    $scope.error = true;
  })
});
