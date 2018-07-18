# lineDeraction.js
基于arcgis for js 绘制带有箭头的导航线条 可以用于行驶轨迹等场景
# 基础用法
            //创建实例
            var myLineDeraction=new LineDeraction({
		            map:map,
		            wkid:3857,
		            // arrowPic:string,//这里你可以输入一个svg图片字符串M819.07712 478.69952l-...//用来自定义箭头符号
		            // data:[[x,y],[x,y],[x,y]...],//数据格式
		            startPic:'imgs/startpoint.png',//图片的路径
		            endPic:'imgs/endpoint.png',//图片的路径
		        });
            //获取数据刷新导航轨迹线
            $.ajax({
		          url:'./data/mock.json',
		          type:'GET',
		          success:function(res){
		            console.log(res);
		            var pointsData=res.map(function(val,key){
		              return [val.lon,val.lat];
		            });

		            myLineDeraction.updateData(pointsData);//使用此方法动态刷新数据

		          }
		        })
# 参数说明
	 //创建实例的参数说明
	map:object,
	wkid:num,
	lineColor:string,
	lineWidth:num,
        arrowColor:string,
  	arrowSize:num,
  	arrowPic:string,
  	step:num,
	data:[[x,y],[x,y],[x,y]...],
  	correctAngle:num//正常情况下箭头方向朝右视为0°，当你的图片箭头朝向是其他时，需要输入与0°的偏差用于矫正;我的示例中图片的箭头是朝下的所以示例中的参数输入的是90
  	startPic:'',
  	startSize:25,
  	endPic:'',
  	endSize:25
