////参数说明
// {
// 	map:object,
// 	wkid:num,
// 	lineColor:string,
// 	lineWidth:num,
//  arrowColor:string,
//  arrowSize:num,
//  arrowPic:string,
//  step:num,
// 	data:[[x,y],[x,y],[x,y]...],
//  correctAngle:num//正常情况下箭头方向朝右视为0°，当你的图片箭头朝向是其他时，需要输入与0°的偏差用于矫正;我的示例中图片的箭头是朝下的所以示例中的参数输入的是90
//  startPic:'',
//  startSize:25,
//  endPic:'',
//  endSize:25
// }

define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point", 
    "esri/geometry/Polyline",
    "esri/SpatialReference",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/Color", 
    "esri/graphic",
    "esri/geometry/Extent"
], function(
    declare,
    _WidgetBase,
    GraphicsLayer,
    Point,
    Polyline,
    SpatialReference,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    PictureMarkerSymbol,
    Color,
    Graphic,
    Extent
) {
    return declare(_WidgetBase, {
	        //这个类通用常量
	        options: {
                map:null,
                wkid:3857,
                lineColor:'#1afa29',
                lineWidth:6,
                arrowColor:'#fff',
                arrowSize:10,
                arrowPic:"M819.07712 478.69952l-225.4848 191.488a81.73568 81.73568 0 0 1-53.0432 19.47648 81.77664 81.77664 0 0 1-53.02272-19.47648l-225.4848-191.488a81.92 81.92 0 1 1 106.06592-124.86656l172.4416 146.45248 172.46208-146.45248a81.92 81.92 0 0 1 106.06592 124.86656z",
                step:90,
                data:null,
                correctAngle:90,
                startPic:'',
                startSize:25,
                endPic:'',
                endSize:25
          },
	        constructor:function(params){
                // var myOption=Object.assign({},this.options,params);
	            var myOption=$.extend({},this.options,params);
	            if(!myOption.map){
	                console.log('参数异常！')
	            }else{
	                this._map=myOption.map;
                    this._wkid=myOption.wkid;
                    this._lineColor=myOption.lineColor;
                    this._lineWidth=myOption.lineWidth;
                    this._arrowColor=myOption.arrowColor;
                    this._arrowSize=myOption.arrowSize;
                    this._arrowPic=myOption.arrowPic;
                    this._step=myOption.step;
                    this._data=myOption.data;
                    this._correntAngle=myOption.correctAngle;
	                  this._startPic=myOption.startPic;
                    this._startSize=myOption.startSize;
                    this._endPic=myOption.endPic;
                    this._endSize=myOption.endSize;

                    this._zoomEndHandler=null;//事件句柄用于管理事件
                    this._panEndHandler=null;//事件句柄用于管理事件

                    this.initHistoryLayer(); 
                    this.initArrowLayer();

                    this.initRefreshEvent();   

                    // if(myOption.data!=null&&myOption.data.length>1){
                    //   this.drawLine();  
                    //   this.drawArrow();
                    // }
                    

	            }
	        },
            initHistoryLayer:function(){
                this._historyLayer=new GraphicsLayer();
                this._map.addLayer(this._historyLayer);
            },
            initArrowLayer:function(){
                this._arrowLayer=new GraphicsLayer();
                this._map.addLayer(this._arrowLayer);
            },
            initRefreshEvent:function(){
                var _this=this;
                _this._zoomEndHandler=_this._map.on('zoom-end',function(){
                    if(_this._data!=null&&_this._data.length>1){
                      _this.drawArrow(_this._data);
                    }
                    
                });
                _this._panEndHandler=_this._map.on('pan-end',function(){
                    if(_this._data!=null&&_this._data.length>1){
                      _this.drawArrow(_this._data);
                    }
                });
            },
            show:function(){
                this._historyLayer.setVisibility(true);
                this._arrowLayer.setVisibility(true);
            },
            hide:function(){
                this._historyLayer.setVisibility(false);
                this._arrowLayer.setVisibility(false);
            },
            drawLine:function(data){
                  var _this=this;
                  var pathsData=[];
                  pathsData.push(data);

                  var lineGeometry=new Polyline({
                    'paths':pathsData,
                    'spatialReference':{'wkid':_this._wkid}
                  });
                  var lineSym=new SimpleLineSymbol(
                                                SimpleLineSymbol.STYLE_SOLID,
                                                new Color(_this._lineColor),
                                                _this._lineWidth
                                              );

                  var lineGraphic=new Graphic(lineGeometry,lineSym);

                  _this._historyLayer.add(lineGraphic);

                  var lineExtent=lineGeometry.getExtent().expand(2);
                  _this._map.setExtent(lineExtent);

            },
            drawArrow:function(data){
                  var _this=this;
                  if(data.length==0){
                      console.log('数据为空！');
                  }else{
                      _this._arrowLayer.clear();

                          var step=_this._step;
                          var sylength=0;
                          var currrentLength=0;
                          var currentStart=_this._map.toScreen(new Point({
                                "x": data[0][0], 
                                "y": data[0][1], 
                                "spatialReference": {"wkid": _this._wkid }
                              }));
                          var arrowNode={};
                          data.map(function(val,key){
                            if(key!=data.length-1){
                              var start=_this._map.toScreen(new Point({
                                "x": val[0], 
                                "y": val[1], 
                                "spatialReference": {"wkid": _this._wkid }
                              }));
                              var end=_this._map.toScreen(new Point({
                                "x": data[key+1][0], 
                                "y": data[key+1][1], 
                                "spatialReference": {"wkid": _this._wkid }
                              }));

                              var dx = end.x - start.x;
                              var dy = start.y - end.y;
                              if(dx==0&&dy==0){
                                //折现中的两个节点挨得太近忽略掉这一段距离
                              }else{
                                  var rotation = Math.atan2(dy, dx);
                                          if(rotation==0){
                                            var nodeDistance=dx;
                                          }else{
                                            var nodeDistance=dy/Math.sin(rotation);
                                          }

                                          if(Number(nodeDistance)<Number(step-currrentLength)){
                                            // console.log('间距过短');
                                            currrentLength+=nodeDistance;
                                            currentStart=end;
                                          }else{
                                            if(currrentLength==0){
                                              sylength=nodeDistance%step;
                                              var splitNum=Math.floor(nodeDistance/step);
                                              var Y=-Math.sin(rotation)*step;
                                              var X=Math.cos(rotation)*step;
                                              for(var i=0;i<splitNum;i++){

                                                arrowNode.x=currentStart.x+X;
                                                arrowNode.y=currentStart.y+Y;
                                                currentStart=arrowNode;

                                                //判断屏幕可视区域
                                                var seeExtent=_this._map.extent;
                                                
                                                var arrowPoint=_this._map.toMap(arrowNode);
                                                if(seeExtent.contains(arrowPoint)){
                                                    var arrowSym=new SimpleMarkerSymbol();
                                                    var path=_this._arrowPic;
                                                    arrowSym.setPath(path);
                                                    arrowSym.setColor(new Color(_this._arrowColor));
                                                    arrowSym.setOutline(null);
                                                    arrowSym.setSize(_this._arrowSize);
                                                    var currrentAngle=(rotation/Math.PI)*180+_this._correntAngle;//svg的起始方向是朝下 所以加90纠正初始角度
                                                    arrowSym.setAngle(-currrentAngle);
                                                    var arrowGraphic=new Graphic(arrowPoint,arrowSym);
                                                    _this._arrowLayer.add(arrowGraphic);
                                                }

                                              }
                                              currrentLength=sylength;
                                              currentStart=end;
                                            }else{
                                              var littleStep=step-currrentLength;
                                              var Y=-Math.sin(rotation)*littleStep;
                                              var X=Math.cos(rotation)*littleStep;
                                              arrowNode.x=currentStart.x+X;
                                              arrowNode.y=currentStart.y+Y;
                                              currentStart=arrowNode;
                                              var arrowPoint=_this._map.toMap(arrowNode);

                                              var arrowSym=new SimpleMarkerSymbol();
                                              var path=_this._arrowPic;
                                              arrowSym.setPath(path);
                                              arrowSym.setColor(new Color(_this._arrowColor));
                                              arrowSym.setOutline(null);
                                              arrowSym.setSize(_this._arrowSize);
                                              var currrentAngle=(rotation/Math.PI)*180+_this._correntAngle;//svg的起始方向是朝下 所以加90纠正初始角度
                                              arrowSym.setAngle(-currrentAngle);
                                              var arrowGraphic=new Graphic(arrowPoint,arrowSym);
                                              _this._arrowLayer.add(arrowGraphic);

                                              sylength=(nodeDistance-littleStep)%step;
                                              var splitNum=Math.floor((nodeDistance-littleStep)/step);
                                              var Y=-Math.sin(rotation)*step;
                                              var X=Math.cos(rotation)*step;
                                              for(var i=0;i<splitNum;i++){

                                                arrowNode.x=currentStart.x+X;
                                                arrowNode.y=currentStart.y+Y;
                                                currentStart=arrowNode;

                                                //判断屏幕可视区域
                                                var seeExtent=_this._map.extent;
                                                
                                                var arrowPoint=_this._map.toMap(arrowNode);
                                                if(seeExtent.contains(arrowPoint)){
                                                    var arrowSym=new SimpleMarkerSymbol();
                                                    var path=_this._arrowPic;
                                                    arrowSym.setPath(path);
                                                    arrowSym.setColor(new Color(_this._arrowColor));
                                                    arrowSym.setOutline(null);
                                                    arrowSym.setSize(_this._arrowSize);
                                                    var currrentAngle=(rotation/Math.PI)*180+_this._correntAngle;//svg的起始方向是朝下 所以加90纠正初始角度
                                                    arrowSym.setAngle(-currrentAngle);
                                                    var arrowGraphic=new Graphic(arrowPoint,arrowSym);
                                                    _this._arrowLayer.add(arrowGraphic);
                                                }

                                                
                                              }
                                              currrentLength=sylength;
                                              currentStart=end;

                                            }

                                          }

                              }  
                            }
                          });

                          //最后添加起点和终点
                          _this.drawStartEnd(data[0],data[data.length-1]);       
                      
                  }
            },
            drawStartEnd:function(startP,endP){
                var _this=this;
                //添加起点终点
                var startGeometry=new Point(startP[0],startP[1],new SpatialReference({wkid:_this._wkid}));
                var startSym=new PictureMarkerSymbol(_this._startPic,_this._startSize,_this._startSize);
                var startPoint=new Graphic(startGeometry,startSym);
                _this._arrowLayer.add(startPoint);
                var endGeometry=new Point(endP[0],endP[1],new SpatialReference({wkid:_this._wkid}));
                var endSym=new PictureMarkerSymbol(_this._endPic,_this._endSize,_this._endSize);
                var endPoint=new Graphic(endGeometry,endSym);
                _this._arrowLayer.add(endPoint);
            },
            updateData:function(data){
                this._data=data;
                if(data.length>1){
                  this.drawLine(data);  //当zoomend panend事件结束之后会触发绘制事件
                  // this.drawArrow();
                }
            },
            clearAllHandler:function(){
                if(this._zoomEndHandler!=null){
                  this._zoomEndHandler.remove();
                }
                if(this._panEndHandler!=null){
                  this._panEndHandler.remove();
                }
            }
            

    });
});