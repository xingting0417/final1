const carCanvas=document.getElementById("carCanvas");
carCanvas.width=window.innerWidth - 330;
carCanvas.width=window.innerWidth;
// const networkCanvas=document.getElementById("networkCanvas");
// networkCanvas.width=300;
const miniMapCanvas=document.getElementById("miniMapCanvas");
miniMapCanvas.width=300;
miniMapCanvas.height=300;
// navigationCanvas.width=300;
// navigationCanvas.height = 300;


carCanvas.height=window.innerHeight;
// networkCanvas.height=window.innerHeight - 300;

const carCtx = carCanvas.getContext("2d");
// const networkCtx = networkCanvas.getContext("2d");

// const worldString = localStorage.getItem("world");
// const worldInfo = worldString ? JSON.parse(worldString) : null;
// const world = worldInfo
//    ? World.load(worldInfo)
//    : new World(new Graph());
const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

const N=1;
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}

const traffic=[];

let roadBorders = [];
const target = world.markings.find((m) => m instanceof Target);
if(target){
    world.generateCorridor(bestCar, target.center);
    roadBorders = world.corridor.map((s) => [s.p1, s.p2])
}
else{
    roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);
}

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const startPoints = world.markings.filter((m) => m instanceof Start);
    const startPoint = startPoints.length > 0
      ? startPoints[0].center
      : new Point(100, 100);
    const dir = startPoints.length > 0
      ? startPoints[0].directionVector
      : new Point(0, -1);
    const startAngle = - angle(dir) + Math.PI / 2;
    
    const cars=[];
    for(let i=1;i<=N;i++){
        const car = new Car(startPoint.x, startPoint.y,30,50,"AI",startAngle);
        car.load(carInfo);
        cars.push(car);
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(roadBorders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(roadBorders,target);
    }
    bestCar=cars.find(
        c=>c.fittness==Math.max(
            ...cars.map(c=>c.fittness)
        ));

    world.cars = cars;
    world.bestCar = bestCar;

    viewport.offset.x = -bestCar.x;
    viewport.offset.y = -bestCar.y;

    viewport.reset();
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(carCtx, viewPoint, false);
    miniMap.update(viewPoint);

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }

    // networkCtx.lineDashOffset=-time/50;
    // networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    // Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
// function changeTarget(el) {
//     // miniMap.img = new Image();
//     // const theCars = optimizing ? cars : [bestCar];
//     switch (el.value) {
//         case "工院":
//             target = world.markings.filter((m) => m instanceof Target)[0];
//             assignPath(theCars, target);
//             // miniMap.img.src = "imgs/karelia.png";
//             // miniMap.destination = target.center;
//             linkToVisit = links["工院"];
//             break;
//         case "管院":
//             target = world.markings.filter((m) => m instanceof Target)[1];
//             assignPath(theCars, target);
//             // miniMap.img.src = "imgs/solenovo.png";
//             // miniMap.destination = target.center;
//             linkToVisit = links["管院"];
//             break;
//         case "人文學院":
//             target = world.markings.filter((m) => m instanceof Target)[2];
//             assignPath(theCars, target);
//             // miniMap.img.src = "imgs/karelics_2.png";
//             // miniMap.destination = target.center;
//             linkToVisit = links["人文學院"];
//             break;
//         case "設計學院":
//             target = world.markings.filter((m) => m instanceof Target)[3];
//             assignPath(theCars, target);
//             // miniMap.img.src = "imgs/uef_2.png";
//             // miniMap.destination = target.center;
//             linkToVisit = links["設計學院"];
//             break;
//             case "未來學院":
//                 target = world.markings.filter((m) => m instanceof Target)[4];
//                 assignPath(theCars, target);
//                 // miniMap.img.src = "imgs/cgi.png";
//                 // miniMap.destination = target.center;
//                 linkToVisit = links["未來學院"];
//                 break;
//                 case "宿舍":
//                     target = world.markings.filter((m) => m instanceof Target)[4];
//                     assignPath(theCars, target);
//                     // miniMap.img.src = "imgs/siili_2.png";
//                     // miniMap.destination = target.center;
//                     linkToVisit = links["宿舍"];
//                     break;
//                     case "體育館":
//                         target = world.markings.filter((m) => m instanceof Target)[4];
//                         assignPath(theCars, target);
//                         // miniMap.img.src = "imgs/blancco.png";
//                         // miniMap.destination = target.center;
//                         linkToVisit = links["體育館"];
//                         break;
//                         case "Nolwenture":
//                             target = world.markings.filter((m) => m instanceof Target)[4];
//                             assignPath(theCars, target);
//                             miniMap.img.src = "imgs/nolwenture.png";
//                             miniMap.destination = target.center;
//                             linkToVisit = links["Nolwenture"];
//                             break;
        
//     }
//     // goingToImg.src = miniMap.img.src;
// }
// function assignPath(cars, target) {
//     for (const car of cars) {
//         if(car.state=="car" || car.onRoad){
//             car.segment = getNearestSegment(car, world.graph.segments);
//             car.destination = target;
//             const segments = world.generateShortestPathBorders(car, target.center);
//             car.assignedBorders = segments;
//         }
//     }
// }