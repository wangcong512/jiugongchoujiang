import { instantiate,_decorator, Component, Node, Label, math,
     tween, Button, Vec3, Tween, ScrollView, RichText, Quat, Animation} from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator; 
@ccclass('UIReward')
export class UIReward extends Component {
    ui: Node;
    uiTipsLayer: Node;
    cell: Node;
    sprite: Node;
    scroll: Node;
    effect: Node;
    path: Array<Vec3>;
    curIndex: number;
    curAnimal: Tween<Node>;
    dataCfg: any;
    flyNode: Node;
    
    start() {
        // 储存所有抽奖格子坐标
        this.path = new Array<Vec3>();
        this.curIndex = 0;
        this.curAnimal = tween()
        this.ui = this.node.getChildByPath("Widget/Layout/cellist")
        this.uiTipsLayer = this.node.getChildByPath("Widget/Layout")
        // 格子
        this.cell =  this.node.getChildByPath("Widget/Layout/cellist/cell")
        // 移动格子图片
        this.sprite = this.node.getChildByPath("Widget/Layout/Sprite")
        // 中奖格子特效
        this.effect = this.node.getChildByPath("Widget/Layout/SpriteAnim")
        // 抽奖记录滚动组件
        this.scroll = this.node.getChildByPath("Widget/Layout/ScrollView")
        // 中奖飞出动画格子
        this.flyNode = instantiate(this.cell)
        // 初始让给子隐藏掉
        this.flyNode.active = false
        this.uiTipsLayer.addChild(this.flyNode)
  
        this.initGame();

    }
    // 初始化游戏界面数
    initGame(){
        // 抽奖格子配置数据 
        this.dataCfg = [
            {
                id: 1,
                name: "手机",
                weight: 20,
            },
            {
                id: 2,
                name: "再来一次",
                weight: 20,
            },
            {
                id: 3,
                name: "谢谢参与",
                weight: 20,
            },
            {
                id: 4,
                name: "苹果",
                weight: 20,
            },
            {
                id: 5,
                name: "梨子",
                weight: 20,
            },
            {
                id: 6,
                name: "香蕉",
                weight: 20,
            },
            {
                id: 7,
                name: "橙子",
                weight: 20,
            },
            {
                id: 8,
                name: "柚子",
                weight: 20,
            }
        ]

        let startX = this.cell.position.x;
        let startY = this.cell.position.y;

        // 创建周围8个格子，并保存每个格子的坐标
        this.dataCfg.forEach((element,index) => {

            const node = instantiate(this.cell);
            let posX = startX + (index%3)*120;
            let posY = startY + Math.floor(index/3)*120;
            if(index == 3){
                posX = startX + 2*120;
                posY = startY + Math.floor(index/3)*120;
            }
            else if(index == 7){
                posX = startX + 0*120;
                posY = startY + 1*120;
            }
            else if(index > 3){
                posX = startX + (2 - (index - 4)%3)*120;
                posY = startY + 2*120;
            }
            this.path.push(new Vec3(posX, posY, 0));
            node.setPosition (posX, posY);
            this.ui.addChild(node)
            let label = node.getChildByPath("Label")
            var showlabel = label.getComponent(Label);
            showlabel.string = element.name
        });
    }

    startAnimal(){
        // 整个动画路径存储
        let animalPath = new Array<Vec3>();
        // 随机数记录抽奖到的格子
        let randomNumber = (max: number, min: number = 0): number => Math.floor(Math.random()*(max - min + 1) + min);
        let randomVal = randomNumber(0, 7)
        // 初始格子位置
        let curId = this.curIndex
        this.sprite.setPosition(this.path[curId].x, this.path[curId].y)
        let nextIndex = (curId + randomVal)%8
        let cellCount = randomVal + 1 + 8
        // 跑动格子的点位记录到路径中来
        for (let index = curId; index <  curId + cellCount; index++) {
            let cellId = index%8
            const element = this.path[cellId];
            animalPath.push(element)
        }
        // 动画开始的时候停止动画，防止多次点击动画叠加
        this.curAnimal.stop()
        this.curAnimal = tween() 
        // 每个格子走动动画
        animalPath.forEach(element => {
            this.curAnimal.target(this.sprite)
            .to(0.1, { position: new Vec3(element.x, element.y, 10) })
            .to(0.03, {scale: new Vec3(1.5, 1, 1)}, {easing: 'sineOutIn'})
            .to(0.03, {scale: new Vec3(1, 1, 1)}, {easing: 'sineOutIn'})
        });
        // 动画结束
        this.curAnimal.call(() => {
            this.curIndex = nextIndex
            console.log("random:",`random:${randomVal} curIndx: ${this.curIndex}`)
            let name: string = this.dataCfg[nextIndex].name
            this.addRecord(name)
            let nextPos = this.path[nextIndex]
            // 播发特效
            this.effect.active = true
            this.effect.setPosition(nextPos.x, nextPos.y)
            let anim: Animation = this.effect.getComponent(Animation)
            // 播放格子上的特效
            anim.play()
            // 中奖物品飞出效果
            tween().target(this.effect).delay(0.5).call(() => {
                this.effect.active = false
                // 播放飞出动画
                this.flyReward(nextPos.x, nextPos.y)
            }).start()
            AudioManager.getInstance().playOneShot("music/zhongjiang");

            
        })

        this.curAnimal.start().call(() => {
            this.curIndex = nextIndex
            console.log("random:",this.curIndex,randomVal)
        })
        AudioManager.getInstance().playOneShot("music/start");
        
        
    }
    onClick(event: Event, customEventData: string){
        console.log("onClick:")
        console.info("onClick:");
        this.startAnimal();
    }
    addRecord(name: string = ""){
        // 抽奖记录，每次抽奖记录到抽奖记录界面中来
        let msg = `<color=#000000FF>恭喜你抽到了</color><color=#DC143CFF>${name}</color>`
        // 滚动组件
        let scrollView = this.scroll.getComponent(ScrollView)
        let itemClone = scrollView.content.getChildByPath("RichText")
        // 克隆一条记录实例
        let itemNode = instantiate(itemClone)
        itemNode.active = true
        itemNode.getComponent(RichText).string = msg
        scrollView.content.addChild(itemNode)
        // 滚动到最底部
        scrollView.scrollToBottom(1)
        
    }
    flyReward(x: number, y: number){
        let endX: number = 0;
        let endY: number = -250;
        this.flyNode.active = true
        this.flyNode.setPosition(x, y)
        this.flyNode.setRotationFromEuler(0, 0, 0)
        this.flyNode.setScale(1, 1, 1)
        let qt: Quat;
        qt = Quat.fromEuler(new Quat(), 0, 0, 135)
        tween().target(this.flyNode)
        .to(1, { position: new Vec3(endX, endY, 0), rotation : qt ,scale: new Vec3(0.3, 0.3, 0)}, {easing: 'quintInOut'})
        .call(() => {
            this.flyNode.active = false
        }).start()


    }

    update(deltaTime: number) {
        
    }
}


