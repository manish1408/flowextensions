angular.module('app', ['flowchart','ui.tree'])
  .factory('prompt', function () {
    return prompt;
  })
  .config(function (NodeTemplatePathProvider) {
    NodeTemplatePathProvider.setTemplatePath("flowchart/node.html");
  })

  .controller('AppCtrl', function AppCtrl($scope, prompt, Modelfactory, flowchartConstants, $http) {

    var deleteKeyCode = 46;
    var ctrlKeyCode = 17;
    var aKeyCode = 65;
    var escKeyCode = 27;
    var nextNodeID = 10;
    var nextConnectorID = 1;
    var ctrlDown = false;
    

    /// The above function creates a right panel from the json file
    $scope.CreateRightPanel = function() {
      $http.get("json/nodePallete.json")
      .then(function(response) {
       $scope.NodePallete  = response.data;

      });
    };
    
    $scope.CreateRightPanel();

    $scope.processData = function() {
      $http.get("json/xmldata.json")
      .then(function(response) {
        var navigationdata =[];
        var template = {
        'id': 1,
        'title': 'node1',
        'type': 'flow',
        'nodes': [
          {
            'id': 11,
            'title': 'node1.1',
            'nodes': []
          }
        ]
      };
          $scope.allxmlData = response.data;
          console.log($scope.allxmlData);

         $scope.allxmlData.FlowInformation.Flows.forEach(function(element) {
           template.id = element.id;
           template.title = element.FlowName;
           template.type = 'flow';
           template.tooltip = 'Show Diagram for ' + element.FlowName;

            var allNodes = [];
            element.Node.forEach(function(el) {


              allNodes.push({
                'id': el.NodeType,
                'title': el.NodeType,
                'tooltip' : 'Add Node ' +el.NodeType + ' to canvas diagram',
                'type' : 'node',
                'nodes': [{
                  'id': el[Object.keys(el)[1]].id,
                 'title': el[Object.keys(el)[1]].Name,
                 'type' : 'attr'
                }]
              });
            }, this);

           

            template.nodes = allNodes;

            navigationdata.push(template);

         }, this);


         console.log(navigationdata);
         $scope.data = navigationdata;
      });
    };
    

    $scope.processData();
    var model = {
      nodes: [],
      edges: []
    };

 var counterY = 1;
      var counterX = 1;
    $scope.handleNodeclick = function(node) {
      var y = 100;
     
      if(node.type == 'flow') {
          node.nodes.forEach(function(element, index) {
            if(index % 5 === 0 && index != 0) {
              y = 100;
              counterY++;
                y = y * counterY;
                counterX = 1;
            }
            $scope.addNewNode(element, counterX*200,  y);
            console.log('Plotted at ' + element+ ',' + counterX*200,  y)
            counterX ++ ;
            
          }, this);
      }
      if(node.type == 'node') {
         $scope.addNewNode(node, counterX * 200,  100 * counterY);
         counterX ++;
         counterY ++;
      }
    };

    $scope.flowchartselected = [];
    var modelservice = Modelfactory(model, $scope.flowchartselected);

    $scope.model = model;
    $scope.modelservice = modelservice;



    $scope.addNewNode = function (nodeName, xaxis, yaxis) {
    
      var newNode = {
        name: nodeName.title,
        id: nextNodeID++,
        x: xaxis,
        y: yaxis,
        color: '#F15B26',
        connectors: [
          {
            id: nextConnectorID++,
            type: flowchartConstants.topConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.topConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.bottomConnectorType
          },
          {
            id: nextConnectorID++,
            type: flowchartConstants.bottomConnectorType
          }
        ]
      };

      model.nodes.push(newNode);
      // model.edges.push(
      //    {
      //     source: 1,
      //     destination: 25
      //   },
      //   {
      //     source: 5,
      //     destination: 50
      //   },
      //   {
      //     source: 4,
      //     destination: 60
      //   }
      // );
    };

    $scope.activateWorkflow = function () {
      angular.forEach($scope.model.edges, function (edge) {
        edge.active = !edge.active;
      });
    };

    $scope.addNewInputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.topConnectorType });
      }
    };

    $scope.addNewOutputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType });
      }
    };

    $scope.deleteSelected = function () {
      modelservice.deleteSelected();
    };

    $scope.callbacks = {
      edgeDoubleClick: function () {
        console.log('Edge double clicked.');
      },
      edgeMouseOver: function () {
        console.log('mouserover')
      },
      isValidEdge: function (source, destination) {
        return source.type === flowchartConstants.bottomConnectorType && destination.type === flowchartConstants.topConnectorType;
      },
      edgeAdded: function (edge) {
        console.log("edge added");
        console.log(edge);
      },
      nodeRemoved: function (node) {
        console.log("node removed");
        console.log(node);
      },
      edgeRemoved: function (edge) {
        console.log("edge removed");
        console.log(edge);
      },
      nodeCallbacks: {
        'doubleClick': function (event) {
          console.log('Node was doubleclicked.')
        }
      }
    };
    modelservice.registerCallbacks($scope.callbacks.edgeAdded, $scope.callbacks.nodeRemoved, $scope.callbacks.edgeRemoved);

    $scope.remove = function (scope) {
        scope.remove();
      };

      $scope.toggle = function (scope) {
        scope.toggle();
      };

      $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
      };

      $scope.newSubItem = function (scope, type) {
        var nodeData = scope.$modelValue;
        if (type === 'node') {
           nodeData.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            type: 'attr'
          });
        } else if (type === 'flow'){
             nodeData.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            type: 'node',
            nodes: []
          });
        } else {
             nodeData.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            nodes: []
          });
        }
      };

      $scope.collapseAll = function () {
        $scope.$broadcast('angular-ui-tree:collapse-all');
      };


      $scope.expandAll = function () {
        $scope.$broadcast('angular-ui-tree:expand-all');
      };
      
      

  });
