import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TW = 13;    // track half-width
const CL = 150;   // chunk length
const NC = 5;     // terrain chunks
const SNOW  = 1800;
const SPRAY = 180;

type OType = 'tree'|'rock'|'cabin'|'jump'|'gift';
interface Slot { g:THREE.Group; type:OType; wz:number; active:boolean; hw:number; hd:number; collect:boolean; collected:boolean; }

function mk(geo:THREE.BufferGeometry, mat:THREE.Material, g:THREE.Group, x=0,y=0,z=0,rx=0,ry=0,rz=0): THREE.Mesh {
  const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; g.add(m); return m;
}

export default function SledGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const startFn  = useRef<()=>void>(()=>{});
  const resetFn  = useRef<()=>void>(()=>{});
  const [ui, setUI] = useState({ score:0, lives:3, speed:0, gameOver:false, started:false, air:false });

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth  || window.innerWidth;
    const H = mount.clientHeight || window.innerHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.setSize(W,H);
    renderer.setClearColor(0,0);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.fog=new THREE.Fog(0xc0ddf5,85,255);
    const camera=new THREE.PerspectiveCamera(65,W/H,0.1,320);
    camera.position.set(0,4,10);
    camera.lookAt(0,0.6,-8);

    // ── Lighting ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xc8dff8,2.0));
    scene.add(new THREE.HemisphereLight(0x9ac8e8,0xffffff,1.1));
    const sun=new THREE.DirectionalLight(0xffe5a0,2.5);
    sun.position.set(-18,28,38); sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    sun.shadow.camera.left=-32; sun.shadow.camera.right=32;
    sun.shadow.camera.top=32;   sun.shadow.camera.bottom=-32;
    sun.shadow.camera.far=130;  sun.shadow.bias=-0.001;
    scene.add(sun);

    // ── Background mountains ──────────────────────────────────────────────
    const mtR=new THREE.MeshLambertMaterial({color:0x7a9aaa});
    const mtS=new THREE.MeshLambertMaterial({color:0xf0f8ff});
    for(let i=0;i<16;i++){
      const h=55+Math.random()*80,r=22+Math.random()*30,s=5+Math.floor(Math.random()*3);
      const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,s),mtR);
      m.position.set((i%2===0?-1:1)*(75+Math.random()*110),h/2-18,-(80+Math.random()*1100));
      m.rotation.y=Math.random()*Math.PI; scene.add(m);
      const c=new THREE.Mesh(new THREE.ConeGeometry(r*.5,h*.38,s),mtS);
      c.position.copy(m.position); c.position.y+=h*.3; c.rotation.y=m.rotation.y; scene.add(c);
    }

    // ── Ground chunks (FIX: recycle at sledZ+CL, not sledZ+20) ───────────
    const gndMat=new THREE.MeshLambertMaterial({color:0xeef6ff});
    const chunks:THREE.Mesh[]=[];
    function mkChunk(z:number){
      const geo=new THREE.PlaneGeometry(TW*2+22,CL,18,36);
      const pos=geo.attributes.position as THREE.BufferAttribute;
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),y=pos.getY(i);
        pos.setZ(i,Math.sin(x*.28+y*.06)*.18+Math.sin(y*.11+x*.09)*.3+Math.sin(y*.32)*.08);
      }
      geo.computeVertexNormals();
      const m=new THREE.Mesh(geo,gndMat); m.rotation.x=-Math.PI/2; m.receiveShadow=true; m.position.z=z;
      scene.add(m); return m;
    }
    for(let i=0;i<NC;i++) chunks.push(mkChunk(-i*CL));

    // ── Side walls (FIX: recycled segments — never run out) ───────────────
    const wallMat=new THREE.MeshLambertMaterial({color:0xddeeff});
    const walls:THREE.Mesh[]=[];
    [-1,1].forEach(s=>{
      for(let i=0;i<3;i++){
        const w=new THREE.Mesh(new THREE.BoxGeometry(9,4.5,CL*2),wallMat);
        w.position.set(s*(TW+4.5),1.8,-i*CL*2); w.receiveShadow=true; scene.add(w); walls.push(w);
      }
    });

    // ── Instanced background pines ────────────────────────────────────────
    const N_P=60;
    const iBush =new THREE.InstancedMesh(new THREE.ConeGeometry(1.9,5.8,7),new THREE.MeshLambertMaterial({color:0x1e5c1c}),N_P);
    const iSnow =new THREE.InstancedMesh(new THREE.ConeGeometry(1.65,1.9,7),new THREE.MeshLambertMaterial({color:0xe4f2ff}),N_P);
    const iTrunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.3,2,6),new THREE.MeshLambertMaterial({color:0x4a2500}),N_P);
    iBush.castShadow=true; [iBush,iSnow,iTrunk].forEach(m=>scene.add(m));
    const pPos:THREE.Vector3[]=[], pSc:number[]=[];
    for(let i=0;i<N_P;i++){ pPos.push(new THREE.Vector3((i%2===0?-1:1)*(TW+4+Math.random()*14),0,-(Math.random()*CL*NC))); pSc.push(.7+Math.random()*.85); }
    const _m4=new THREE.Matrix4(),_p3=new THREE.Vector3(),_q=new THREE.Quaternion(),_s3=new THREE.Vector3();
    function syncPines(sz:number){
      for(let i=0;i<N_P;i++){
        if(pPos[i].z>sz+28){pPos[i].z-=CL*NC;pPos[i].x=(i%2===0?-1:1)*(TW+4+Math.random()*14);}
        const sc=pSc[i]; _q.identity(); _s3.set(sc,sc,sc);
        _p3.set(pPos[i].x,1*sc,pPos[i].z); _m4.compose(_p3,_q,_s3); iTrunk.setMatrixAt(i,_m4);
        _p3.set(pPos[i].x,3.9*sc,pPos[i].z); _m4.compose(_p3,_q,_s3); iBush.setMatrixAt(i,_m4);
        _p3.set(pPos[i].x,4.7*sc,pPos[i].z); _m4.compose(_p3,_q,_s3); iSnow.setMatrixAt(i,_m4);
      }
      iTrunk.instanceMatrix.needsUpdate=true; iBush.instanceMatrix.needsUpdate=true; iSnow.instanceMatrix.needsUpdate=true;
    }
    syncPines(0);

    // ── Shared obstacle materials ─────────────────────────────────────────
    const M={
      trunkBr: new THREE.MeshLambertMaterial({color:0x4a2500}),
      leafDk:  new THREE.MeshLambertMaterial({color:0x1a5018}),
      leafMd:  new THREE.MeshLambertMaterial({color:0x226022}),
      leafLt:  new THREE.MeshLambertMaterial({color:0x2e7030}),
      capSn:   new THREE.MeshLambertMaterial({color:0xe4f2ff}),
      starY:   new THREE.MeshBasicMaterial({color:0xffdd00}),
      rock:    new THREE.MeshLambertMaterial({color:0x7a8a99}),
      rockSn:  new THREE.MeshLambertMaterial({color:0xe4f2ff}),
      log:     new THREE.MeshLambertMaterial({color:0x7c4422}),
      roof:    new THREE.MeshLambertMaterial({color:0x4a2a0a}),
      win:     new THREE.MeshBasicMaterial({color:0xffee88}),
      door:    new THREE.MeshLambertMaterial({color:0x3a1800}),
      ramp:    new THREE.MeshLambertMaterial({color:0xd8eeff}),
      stripe:  new THREE.MeshBasicMaterial({color:0xff2200}),
      giftR:   new THREE.MeshLambertMaterial({color:0xff2222}),
      giftG:   new THREE.MeshLambertMaterial({color:0x22aa44}),
      giftB:   new THREE.MeshLambertMaterial({color:0x2244cc}),
      giftY:   new THREE.MeshLambertMaterial({color:0xffaa00}),
      ribbon:  new THREE.MeshBasicMaterial({color:0xffd700}),
    };

    function makeTree():THREE.Group{
      const g=new THREE.Group();
      mk(new THREE.CylinderGeometry(.2,.32,2.4,7),M.trunkBr,g,0,1.2,0);
      [{r:2.1,h:2.7,y:2.6,m:M.leafDk},{r:1.55,h:2.3,y:4.0,m:M.leafMd},{r:1.0,h:2.0,y:5.2,m:M.leafLt},{r:.55,h:1.5,y:6.2,m:M.leafLt}].forEach(({r,h,y,m})=>{
        mk(new THREE.ConeGeometry(r,h,8),m,g,0,y,0);
        mk(new THREE.ConeGeometry(r*.87,h*.3,8),M.capSn,g,0,y+h*.14,0);
      });
      mk(new THREE.OctahedronGeometry(.28),M.starY,g,0,7.4,0);
      g.position.y=-999; return g;
    }
    function makeRock():THREE.Group{
      const g=new THREE.Group();
      const sz=.7+Math.random()*.55;
      const rm=new THREE.Mesh(new THREE.IcosahedronGeometry(sz,1),M.rock); rm.position.y=sz*.45; rm.castShadow=true; g.add(rm);
      mk(new THREE.SphereGeometry(sz*.68,7,5,0,Math.PI*2,0,Math.PI*.52),M.rockSn,g,0,sz*.68,0);
      g.position.y=-999; return g;
    }
    function makeCabin():THREE.Group{
      const g=new THREE.Group();
      mk(new THREE.BoxGeometry(3.2,2.2,3.8),M.log,g,0,1.1,0);
      mk(new THREE.ConeGeometry(2.65,1.9,4),M.roof,g,0,3.05,0,0,Math.PI/4,0);
      mk(new THREE.ConeGeometry(2.45,.65,4),M.capSn,g,0,3.1,0,0,Math.PI/4,0);
      mk(new THREE.BoxGeometry(.52,.46,.04),M.win,g,.72,1.22,1.93);
      mk(new THREE.BoxGeometry(.52,.46,.04),M.win,g,-.72,1.22,1.93);
      mk(new THREE.BoxGeometry(.62,.92,.04),M.door,g,0,.46,1.93);
      mk(new THREE.BoxGeometry(.38,.85,.38),M.roof,g,.85,3.15,.52);
      g.position.y=-999; return g;
    }
    function makeJump():THREE.Group{
      const g=new THREE.Group();
      mk(new THREE.BoxGeometry(8,.92,5.2),M.ramp,g,0,.46,0,-.28,0,0).receiveShadow=true;
      [-2.6,0,2.6].forEach(sx=>mk(new THREE.BoxGeometry(.26,.94,5.2),M.stripe,g,sx,.47,0,-.28,0,0));
      g.position.y=-999; return g;
    }
    function makeGift():THREE.Group{
      const g=new THREE.Group();
      const gMats=[M.giftR,M.giftG,M.giftB,M.giftY];
      const bm=gMats[Math.floor(Math.random()*gMats.length)];
      mk(new THREE.BoxGeometry(.9,.9,.9),bm,g,0,.45,0);
      mk(new THREE.BoxGeometry(.1,.92,.92),M.ribbon,g,0,.45,0);
      mk(new THREE.BoxGeometry(.92,.92,.1),M.ribbon,g,0,.45,0);
      const b1=mk(new THREE.TorusGeometry(.18,.038,6,10),M.ribbon,g,-.17,.94,0); b1.rotation.z=.5;
      const b2=mk(new THREE.TorusGeometry(.18,.038,6,10),M.ribbon,g,.17,.94,0);  b2.rotation.z=-.5;
      g.position.y=-999; return g;
    }

    const pool:Slot[]=[];
    ([['tree',makeTree,1.0,1.1,false,7],['rock',makeRock,.9,.9,false,6],['cabin',makeCabin,1.7,2.1,false,5],['jump',makeJump,4.2,2.6,false,6],['gift',makeGift,.6,.6,true,6]] as Array<[OType,()=>THREE.Group,number,number,boolean,number]>)
      .forEach(([type,fac,hw,hd,collect,cnt])=>{ for(let i=0;i<cnt;i++){const g=fac();scene.add(g);pool.push({g,type,wz:-99999,active:false,hw,hd,collect,collected:false});} });

    // ── Wooden sled with curved runners ──────────────────────────────────
    const sg=new THREE.Group();

    // Materials
    const mapleMat  = new THREE.MeshLambertMaterial({color:0xd4a96a}); // maple wood planks
    const darkWood  = new THREE.MeshLambertMaterial({color:0x7a3e10}); // dark walnut runners
    const midWood   = new THREE.MeshLambertMaterial({color:0xa05c2a}); // medium cross-members
    const ironMat   = new THREE.MeshLambertMaterial({color:0x444450}); // iron/metal fittings
    const ropeMat   = new THREE.MeshLambertMaterial({color:0xc8a04a}); // rope/leather straps

    // 5 wooden planks (the sled deck)
    for(let i=0;i<5;i++){
      const px=(i-2)*.22;
      mk(new THREE.BoxGeometry(.18,.07,2.18),mapleMat,sg,px,0,0);
    }
    // 3 cross members (underneath, connecting planks)
    [-0.82,0,.82].forEach(cz=> mk(new THREE.BoxGeometry(1.15,.1,.13),midWood,sg,0,-.07,cz));
    // 2 leather strap details (diagonal)
    mk(new THREE.BoxGeometry(1.1,.04,.07),ropeMat,sg,0,.038,-.6,-0.1,0,.25);
    mk(new THREE.BoxGeometry(1.1,.04,.07),ropeMat,sg,0,.038,.4, 0.1,0,-.25);

    // Curved TubeGeometry runners (the best part!)
    const runnerPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,.04,1.05),
      new THREE.Vector3(0,.04,.5),
      new THREE.Vector3(0,.04,-.4),
      new THREE.Vector3(0,.1,-.78),
      new THREE.Vector3(0,.24,-1.04),
      new THREE.Vector3(0,.38,-1.22),
      new THREE.Vector3(0,.44,-1.3),
      new THREE.Vector3(0,.42,-1.24),
    ]);
    const runnerTubeGeo=new THREE.TubeGeometry(runnerPath,30,0.034,8,false);
    const runnerL=new THREE.Mesh(runnerTubeGeo,darkWood); runnerL.position.set(-0.5,-.2,0); runnerL.castShadow=true; sg.add(runnerL);
    const runnerR=runnerL.clone(); runnerR.position.set(0.5,-.2,0); sg.add(runnerR);

    // Iron bolt caps on runners
    [-0.5,0.5].forEach(rx=>[-0.7,0.3].forEach(rz=>mk(new THREE.CylinderGeometry(.04,.04,.12,7),ironMat,sg,rx,.04,rz,Math.PI/2,0,0)));

    // ── Reindeer (in front of sled) ───────────────────────────────────────
    const bodyBrown  = new THREE.MeshLambertMaterial({color:0x8b4513});
    const bellyTan   = new THREE.MeshLambertMaterial({color:0xb06535});
    const darkBrown  = new THREE.MeshLambertMaterial({color:0x5c2e00});
    const hoof       = new THREE.MeshLambertMaterial({color:0x1a0a00});
    const rNose      = new THREE.MeshLambertMaterial({color:0xff2200});
    const eyeBlack   = new THREE.MeshBasicMaterial({color:0x050505});
    const antlerBr   = new THREE.MeshLambertMaterial({color:0x7a4820});
    const harness    = new THREE.MeshLambertMaterial({color:0xcc2200});
    const whiteFluff = new THREE.MeshLambertMaterial({color:0xfafafa});
    const bellGold   = new THREE.MeshBasicMaterial({color:0xffd700});

    const deer=new THREE.Group();
    // Body
    mk(new THREE.BoxGeometry(.72,.54,1.52),bodyBrown,deer,0,.56,0);
    mk(new THREE.BoxGeometry(.56,.3,.9),bellyTan,deer,0,.46,.05);
    // Neck (angled forward+up)
    const neck=mk(new THREE.BoxGeometry(.3,.48,.3),bodyBrown,deer,0,.92,-.52); neck.rotation.x=.38;
    // Head
    mk(new THREE.BoxGeometry(.36,.3,.46),bodyBrown,deer,0,1.2,-.84);
    mk(new THREE.BoxGeometry(.24,.22,.35),darkBrown,deer,0,1.1,-1.04); // snout
    mk(new THREE.SphereGeometry(.09,8,6),rNose,deer,0,1.1,-1.22);       // red nose!
    // Eyes
    [-.13,.13].forEach(ex=>mk(new THREE.SphereGeometry(.04,6,5),eyeBlack,deer,ex,1.24,-.98));
    // Ears
    [-.22,.22].forEach(ex=>{ const e=mk(new THREE.BoxGeometry(.1,.2,.07),bodyBrown,deer,ex,1.38,-.74); e.rotation.z=ex<0?-.3:.3; });
    // Antlers
    [-1,1].forEach(side=>{
      const ax=side*.24;
      // Main stem
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.026,.034,.6,6),antlerBr);
      stem.position.set(ax,1.58,-.8); stem.rotation.z=side*.22; stem.rotation.x=-.28; deer.add(stem);
      // Forward branch
      const bf=new THREE.Mesh(new THREE.CylinderGeometry(.018,.024,.32,6),antlerBr);
      bf.position.set(ax+side*.06,1.74,-.9); bf.rotation.z=side*.55; bf.rotation.x=.18; deer.add(bf);
      // Backward branch
      const bb=new THREE.Mesh(new THREE.CylinderGeometry(.016,.02,.26,6),antlerBr);
      bb.position.set(ax+side*.07,1.7,-.72); bb.rotation.z=side*.7; bb.rotation.x=-.22; deer.add(bb);
      // Top tine
      const tt=new THREE.Mesh(new THREE.CylinderGeometry(.01,.016,.2,5),antlerBr);
      tt.position.set(ax+side*.09,1.85,-.94); tt.rotation.z=side*.45; deer.add(tt);
    });
    // 4 legs [xOffset, zOffset]
    [[-0.23,-0.48],[0.23,-0.48],[-0.23,0.42],[0.23,0.42]].forEach(([lx,lz])=>{
      mk(new THREE.CylinderGeometry(.078,.068,.38,7),bodyBrown,deer,lx,.24,lz);
      mk(new THREE.CylinderGeometry(.062,.052,.36,7),darkBrown,deer,lx,.02,lz);
      mk(new THREE.BoxGeometry(.13,.1,.18),hoof,deer,lx,-.14,lz);
    });
    // Fluffy white tail
    mk(new THREE.SphereGeometry(.13,7,5),whiteFluff,deer,0,.62,.78);
    // Red harness collar
    const harnessTorus=new THREE.Mesh(new THREE.TorusGeometry(.22,.04,8,16),harness);
    harnessTorus.position.set(0,.7,-.32); harnessTorus.rotation.x=Math.PI/2; deer.add(harnessTorus);
    // Jingle bell on harness
    mk(new THREE.SphereGeometry(.07,7,6),bellGold,deer,0,.7,-.12);
    // Trace lines (sled to deer, thin rope)
    [-.28,.28].forEach(tx=>{
      mk(new THREE.CylinderGeometry(.018,.018,2.2,5),ropeMat,sg,tx,.02,-1.6, 0,0,0);
    });

    deer.position.set(0,0,-3.0);
    sg.add(deer);

    // ── Santa rider ───────────────────────────────────────────────────────
    const santaRed   = new THREE.MeshLambertMaterial({color:0xcc1818});
    const santaWhite = new THREE.MeshLambertMaterial({color:0xf5f5f5});
    const santaSkin  = new THREE.MeshLambertMaterial({color:0xffcc99});
    const santaBlack = new THREE.MeshLambertMaterial({color:0x1a1a1a});
    const santaBelt  = new THREE.MeshBasicMaterial({color:0x111111});

    // Legs (tucked, sitting on sled)
    [-.2,.2].forEach(lx=>mk(new THREE.BoxGeometry(.22,.28,.52),santaBlack,sg,lx,.18,.55));
    // Red coat body
    mk(new THREE.BoxGeometry(.6,.72,.5),santaRed,sg,0,.58,.18);
    // White trim at bottom of coat
    mk(new THREE.BoxGeometry(.64,.1,.52),santaWhite,sg,0,.22,.18);
    // Belt (dark stripe)
    mk(new THREE.BoxGeometry(.62,.1,.52),santaBelt,sg,0,.44,.18);
    // Belt buckle
    mk(new THREE.BoxGeometry(.12,.1,.06),new THREE.MeshBasicMaterial({color:0xddcc00}),sg,0,.44,.22);
    // Arms (holding reins, angled forward)
    [-.55,.55].forEach((ax,ai)=>{
      const arm=mk(new THREE.BoxGeometry(.48,.2,.2),santaRed,sg,ax,.5,.1); arm.rotation.z=ai===0?.25:-.25;
    });
    // Gloves
    [-.72,.72].forEach(gx=>mk(new THREE.SphereGeometry(.1,7,6),santaBlack,sg,gx,.42,.1));
    // White beard
    mk(new THREE.BoxGeometry(.42,.3,.24),santaWhite,sg,0,.86,.2);
    mk(new THREE.SphereGeometry(.14,8,6),santaWhite,sg,0,.8,.22); // beard puff
    // Head
    mk(new THREE.SphereGeometry(.22,10,8),santaSkin,sg,0,1.1,.18);
    // Hat (red with white rim)
    mk(new THREE.CylinderGeometry(.05,.24,.4,9),santaRed,sg,0,1.4,.16);
    mk(new THREE.CylinderGeometry(.27,.27,.08,14),santaWhite,sg,0,1.2,.16);
    mk(new THREE.SphereGeometry(.06,7,5),santaWhite,sg,0,1.62,.14);

    sg.castShadow=true; sg.position.set(0,.15,0); scene.add(sg);

    // ── Snow particles ────────────────────────────────────────────────────
    const snP=new Float32Array(SNOW*3),snV=new Float32Array(SNOW*3);
    for(let i=0;i<SNOW;i++){
      snP[i*3]=(Math.random()-.5)*80; snP[i*3+1]=Math.random()*36+3; snP[i*3+2]=(Math.random()-.5)*80;
      snV[i*3]=(Math.random()-.5)*.22; snV[i*3+1]=-(0.6+Math.random()*1.4); snV[i*3+2]=(Math.random()-.5)*.18;
    }
    const snGeo=new THREE.BufferGeometry(); snGeo.setAttribute('position',new THREE.BufferAttribute(snP,3));
    scene.add(new THREE.Points(snGeo,new THREE.PointsMaterial({color:0xffffff,size:.16,transparent:true,opacity:.8,sizeAttenuation:true})));

    const spP=new Float32Array(SPRAY*3),spV=new Float32Array(SPRAY*3),spL=new Float32Array(SPRAY);
    for(let i=0;i<SPRAY;i++){spP[i*3+1]=-999;spL[i]=0;}
    const spGeo=new THREE.BufferGeometry(); spGeo.setAttribute('position',new THREE.BufferAttribute(spP,3));
    scene.add(new THREE.Points(spGeo,new THREE.PointsMaterial({color:0xeef8ff,size:.22,transparent:true,opacity:.72,sizeAttenuation:true})));
    let spIdx=0;

    // ── Game state ────────────────────────────────────────────────────────
    let sledX=0,sledZ=0,sledY=.15,speed=20,score=0,lives=3;
    let started=false,gameOver=false,inv=0;
    let airY=0,airVY=0,onGround=true,tiltZ=0,tiltX=0,spaceWas=false;
    let genTo=0,frame=0;

    function freeSlot(t:OType){ return pool.find(e=>e.type===t&&!e.active); }
    function genChunk(from:number){
      const to=from-260; let z=from-15;
      while(z>to){
        const r=Math.random(),x=(Math.random()-.5)*(TW-2.2)*2;
        if(r<.08){const e=freeSlot('jump');if(e){e.g.position.set(x*.3,0,z);e.wz=z;e.active=true;}z-=28+Math.random()*12;}
        else if(r<.22){const e=freeSlot('cabin');if(e){e.g.position.set(x,0,z);e.g.rotation.y=(Math.random()-.5)*.5;e.wz=z;e.active=true;}z-=20+Math.random()*12;}
        else if(r<.42){const e=freeSlot('rock');if(e){e.g.position.set(x,0,z);e.wz=z;e.active=true;}z-=14+Math.random()*10;}
        else if(r<.65){const e=freeSlot('tree');if(e){e.g.position.set(x,0,z);e.g.rotation.y=Math.random()*Math.PI;e.wz=z;e.active=true;e.collected=false;}z-=16+Math.random()*12;}
        else if(r<.80){const e=freeSlot('gift');if(e){e.g.position.set(x,.5,z);e.wz=z;e.active=true;e.collected=false;}z-=14+Math.random()*10;}
        else{z-=10+Math.random()*8;}
      }
      return to;
    }
    function doReset(){
      sledX=0;sledZ=0;sledY=.15;speed=20;score=0;lives=3;
      started=true;gameOver=false;inv=0;airY=0;airVY=0;onGround=true;
      tiltZ=0;tiltX=0;spaceWas=false;frame=0;
      sg.position.set(0,.15,0);sg.visible=true;
      pool.forEach(e=>{e.g.position.set(0,-999,0);e.active=false;e.wz=-99999;e.collected=false;});
      genTo=genChunk(0);
      setUI({score:0,lives:3,speed:20,gameOver:false,started:true,air:false});
    }
    startFn.current=()=>{started=true;setUI(p=>({...p,started:true}));};
    resetFn.current=doReset;

    const keys={a:false,d:false,w:false,s:false,space:false};
    const onKD=(e:KeyboardEvent)=>{
      if(e.code==='Space')e.preventDefault();
      if(!started&&(e.code==='Space'||e.code==='Enter')){started=true;setUI(p=>({...p,started:true}));return;}
      if(gameOver&&(e.code==='Space'||e.key.toLowerCase()==='r')){doReset();return;}
      if(e.key==='a'||e.key==='A')keys.a=true; if(e.key==='d'||e.key==='D')keys.d=true;
      if(e.key==='w'||e.key==='W')keys.w=true; if(e.key==='s'||e.key==='S')keys.s=true;
      if(e.code==='Space')keys.space=true;
    };
    const onKU=(e:KeyboardEvent)=>{
      if(e.key==='a'||e.key==='A')keys.a=false; if(e.key==='d'||e.key==='D')keys.d=false;
      if(e.key==='w'||e.key==='W')keys.w=false; if(e.key==='s'||e.key==='S')keys.s=false;
      if(e.code==='Space')keys.space=false;
    };
    window.addEventListener('keydown',onKD); window.addEventListener('keyup',onKU);
    const onR=()=>{const w=mount.clientWidth||window.innerWidth,h=mount.clientHeight||window.innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    window.addEventListener('resize',onR);

    genTo=genChunk(0);

    // ── Main loop ─────────────────────────────────────────────────────────
    const clock=new THREE.Clock();
    let raf:number;
    const camT=new THREE.Vector3(0,4,10);

    function tick(){
      raf=requestAnimationFrame(tick);
      const dt=Math.min(clock.getDelta(),.05);
      frame++;

      if(!started||gameOver){renderer.render(scene,camera);return;}

      if(keys.w)speed=Math.min(speed+12*dt,72);
      if(keys.s)speed=Math.max(speed-10*dt,8);
      speed+=dt*1.5; score+=dt*speed*.55;

      const st=(8+speed*.055)*dt;
      if(keys.a)sledX-=st; if(keys.d)sledX+=st;
      if(sledX<-(TW-.8)){sledX=-(TW-.8);speed*=.9;}
      if(sledX> TW-.8 ){sledX= TW-.8; speed*=.9;}
      sledZ-=speed*dt;

      if(keys.space&&!spaceWas&&onGround){airVY=8.8;onGround=false;}
      spaceWas=keys.space;
      if(!onGround){
        airVY-=24*dt; airY+=airVY*dt;
        if(airY<=0){
          airY=0;airVY=0;onGround=true;
          const sp=spGeo.attributes.position as THREE.BufferAttribute;
          for(let b=0;b<22;b++){const si=(spIdx+b)%SPRAY;sp.setXYZ(si,sledX+(Math.random()-.5)*1.5,.18,sledZ+(Math.random()-.5)*1.5);spV[si*3]=(Math.random()-.5)*5;spV[si*3+1]=1.8+Math.random()*3.5;spV[si*3+2]=(Math.random()-.5)*4.5;spL[si]=1.0;}
          spIdx=(spIdx+22)%SPRAY; (spGeo.attributes.position as THREE.BufferAttribute).needsUpdate=true;
        }
      }
      sledY=.15+airY;

      tiltZ+=((keys.a?.21:keys.d?-.21:0)-tiltZ)*10*dt;
      tiltX+=((!onGround?-.2:0)-tiltX)*8*dt;
      sg.position.set(sledX,sledY,sledZ);
      sg.rotation.set(tiltX,-tiltZ*.22,tiltZ);
      camera.fov=65+speed*.1; camera.updateProjectionMatrix();

      // ── Terrain recycle (FIX: threshold = sledZ + CL) ─────────────────
      for(const c of chunks) while(c.position.z>sledZ+CL) c.position.z-=CL*NC;

      // ── Wall recycle (infinite walls) ─────────────────────────────────
      for(const w of walls) while(w.position.z>sledZ+CL) w.position.z-=CL*6;

      if(frame%2===0) syncPines(sledZ);
      if(sledZ<genTo+280) genTo=genChunk(genTo);

      for(const e of pool){
        if(e.active&&e.wz>sledZ+30){e.g.position.set(0,-999,0);e.active=false;e.wz=-99999;e.collected=false;}
      }

      if(inv>0){inv--;sg.visible=Math.floor(inv/8)%2===0;}
      else{
        sg.visible=true;
        for(const e of pool){
          if(!e.active)continue;
          const dx=Math.abs(e.g.position.x-sledX),dz=Math.abs(e.g.position.z-sledZ);
          if(e.type==='jump'){if(dx<e.hw&&dz<e.hd&&onGround){airVY=11+speed*.14;onGround=false;}continue;}
          if(e.type==='gift'){if(!e.collected&&dx<1.0&&dz<1.1){e.collected=true;score+=500;e.g.position.y=-999;setUI(p=>({...p,score:Math.floor(p.score)+500}));}continue;}
          if(!onGround&&airY>.8)continue;
          if(dx<e.hw+.32&&dz<e.hd+.55){lives--;speed=Math.max(speed*.5,8);inv=155;if(lives<=0){gameOver=true;setUI(p=>({...p,lives:0,gameOver:true,score:Math.floor(score)}));}else setUI(p=>({...p,lives}));break;}
        }
      }

      if(frame%2===0){
        for(const e of pool) if(e.type==='gift'&&e.active&&!e.collected){e.g.position.y=.5+Math.sin(frame*.04+e.wz*.08)*.2;e.g.rotation.y+=.03;}
        // Deer leg swing (subtle)
        const legSwing=Math.sin(frame*.12)*0.18;
        if(deer.children.length>0){
          [12,13,14,15].forEach((li,i)=>{ const leg=deer.children[li]; if(leg) leg.rotation.x=(i%2===0?legSwing:-legSwing)*.5; });
        }
      }

      // Snow
      if(frame%2===0){
        const sp=snGeo.attributes.position as THREE.BufferAttribute;
        for(let i=0;i<SNOW;i++){
          const y=sp.getY(i)+snV[i*3+1]*dt*32; sp.setY(i,y);
          sp.setX(i,sp.getX(i)+snV[i*3]*dt*8+Math.sin(frame*.013+i*.45)*.009);
          sp.setZ(i,sp.getZ(i)+snV[i*3+2]*dt*6);
          if(y<sledY-.3){sp.setX(i,sledX+(Math.random()-.5)*70);sp.setY(i,sledY+30+Math.random()*10);sp.setZ(i,sledZ+(Math.random()-.5)*70);}
        }
        sp.needsUpdate=true;
      }

      // Spray
      {const sp=spGeo.attributes.position as THREE.BufferAttribute;
      for(let i=0;i<SPRAY;i++){if(spL[i]>0){spL[i]-=dt*2.5;sp.setX(i,sp.getX(i)+spV[i*3]*dt);sp.setY(i,sp.getY(i)+spV[i*3+1]*dt);sp.setZ(i,sp.getZ(i)+spV[i*3+2]*dt);spV[i*3+1]-=9*dt;if(spL[i]<=0)sp.setXYZ(i,0,-999,0);}}
      if(speed>22&&onGround&&frame%2===0){const si=spIdx%SPRAY;sp.setXYZ(si,sledX+(Math.random()-.5)*.6,.1,sledZ+.9);spV[si*3]=(Math.random()-.5)*2;spV[si*3+1]=.7+Math.random()*1.3;spV[si*3+2]=2+Math.random()*2.8;spL[si]=.4+Math.random()*.25;spIdx=(spIdx+1)%SPRAY;}
      sp.needsUpdate=true;}

      // Camera (pulled back to show reindeer)
      camT.set(sledX*.8,sledY+4.2+airY*.3,sledZ+9.5);
      camera.position.lerp(camT,.1);
      camera.lookAt(sledX*.6,sledY+.8,sledZ-11);
      sun.position.set(camera.position.x-18,camera.position.y+28,sledZ+55);

      if(frame%18===0) setUI(p=>({...p,score:Math.floor(score),speed:Math.round(speed),air:!onGround}));
      renderer.render(scene,camera);
    }
    tick();

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown',onKD); window.removeEventListener('keyup',onKU); window.removeEventListener('resize',onR);
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  },[]);

  const hearts=Array.from({length:Math.max(0,ui.lives)},(_,i)=>(
    <span key={i} style={{color:'#ff2222',fontSize:22,marginRight:2,filter:'drop-shadow(0 0 5px rgba(255,0,0,.7))'}}>♥</span>
  ));

  return (
    <div style={{width:'100vw',height:'100vh',position:'relative',overflow:'hidden',
      background:'linear-gradient(175deg,#1a3d6e 0%,#3a80cc 22%,#7bbde0 45%,#c8e8f5 62%,#ffdaaa 78%,#ff8030 92%,#ff5010 100%)'}}>
      <div ref={mountRef} style={{position:'absolute',inset:0}}/>

      {ui.started&&!ui.gameOver&&(
        <div style={{position:'absolute',top:18,left:20,pointerEvents:'none',userSelect:'none',fontFamily:'"Segoe UI",system-ui,sans-serif',color:'#fff'}}>
          <div style={{background:'rgba(8,25,65,.48)',borderRadius:16,padding:'10px 20px',backdropFilter:'blur(8px)',boxShadow:'0 2px 20px rgba(0,0,0,.35)'}}>
            <div style={{fontSize:30,fontWeight:800,letterSpacing:1,lineHeight:1}}>{ui.score.toLocaleString()}<span style={{fontSize:13,opacity:.6,marginLeft:4}}>pts</span></div>
            <div style={{fontSize:15,marginTop:3,opacity:.88}}>⚡ {ui.speed} km/h{ui.air&&<span style={{color:'#88ffcc',fontWeight:700,marginLeft:10}}>✈ AIR!</span>}</div>
            <div style={{marginTop:7,lineHeight:1}}>{hearts}</div>
          </div>
        </div>
      )}

      {ui.started&&!ui.gameOver&&(
        <div style={{position:'absolute',bottom:18,right:18,pointerEvents:'none',color:'rgba(255,255,255,.6)',fontFamily:'monospace',fontSize:11,background:'rgba(0,20,55,.32)',borderRadius:10,padding:'8px 13px',backdropFilter:'blur(4px)',lineHeight:1.95}}>
          A / D — steer<br/>W / S — speed<br/>SPACE — jump
        </div>
      )}

      {!ui.started&&(
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(8,22,55,.78)',backdropFilter:'blur(6px)',color:'#fff',fontFamily:'"Segoe UI",system-ui,sans-serif',textAlign:'center',userSelect:'none',padding:'0 20px'}}>
          <div style={{fontSize:88,lineHeight:1,marginBottom:4}}>🛷</div>
          <h1 style={{fontSize:62,fontWeight:900,margin:'4px 0 8px',background:'linear-gradient(135deg,#fff 0%,#aadfff 45%,#ffcc66 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:3}}>WINTER SLED</h1>
          <p style={{fontSize:16,opacity:.72,marginBottom:24,letterSpacing:1}}>A Christmas Mountain Descent</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 30px',marginBottom:16,fontSize:14,opacity:.85,lineHeight:1.9}}>
            <span>⬅ A — steer left</span><span>➡ D — steer right</span>
            <span>⬆ W — speed up</span><span>⬇ S — slow down</span>
            <span style={{gridColumn:'1/-1',color:'#aaffcc',fontWeight:700,fontSize:16}}>SPACE — jump over obstacles!</span>
          </div>
          <div style={{display:'flex',gap:18,marginBottom:30,fontSize:13,opacity:.62,flexWrap:'wrap',justifyContent:'center'}}>
            <span>🌲 trees</span><span>🪨 rocks</span><span>🏠 cabins</span><span>🎁 gifts = +500!</span>
          </div>
          <button onClick={()=>startFn.current()} style={{padding:'15px 54px',fontSize:21,fontWeight:800,background:'linear-gradient(135deg,#bb2000,#ff4400)',color:'#fff',border:'3px solid rgba(255,255,255,.32)',borderRadius:50,cursor:'pointer',boxShadow:'0 6px 32px rgba(255,80,0,.55)',letterSpacing:2}}>
            🎿  SLED!
          </button>
          <p style={{marginTop:16,opacity:.4,fontSize:12}}>or press SPACE / ENTER</p>
        </div>
      )}

      {ui.gameOver&&(
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(4,12,35,.86)',backdropFilter:'blur(7px)',color:'#fff',fontFamily:'"Segoe UI",system-ui,sans-serif',textAlign:'center',userSelect:'none'}}>
          <div style={{fontSize:76,marginBottom:6}}>💥</div>
          <h1 style={{fontSize:62,fontWeight:900,color:'#ff4040',margin:'0 0 12px',textShadow:'0 0 40px rgba(255,0,0,.55)'}}>WIPEOUT!</h1>
          <p style={{fontSize:34,fontWeight:700,margin:'0 0 6px'}}>{ui.score.toLocaleString()} pts</p>
          <p style={{fontSize:15,opacity:.5,marginBottom:30}}>Peak speed: {ui.speed} km/h</p>
          <button onClick={()=>resetFn.current()} style={{padding:'14px 48px',fontSize:19,fontWeight:700,background:'linear-gradient(135deg,#1155cc,#2266ee)',color:'#fff',border:'2px solid rgba(255,255,255,.28)',borderRadius:50,cursor:'pointer',boxShadow:'0 4px 24px rgba(30,100,255,.5)',letterSpacing:1}}>
            🎿  TRY AGAIN
          </button>
          <p style={{marginTop:14,opacity:.35,fontSize:12}}>or press SPACE / R</p>
        </div>
      )}
    </div>
  );
}
