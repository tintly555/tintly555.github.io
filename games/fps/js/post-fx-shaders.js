import { TEMPLE_WATER_GLSL, TEMPLE_WATER_Y } from "./water-shape.js";

export const VERTEX = `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }
`;

const DEPTH = `
  uniform sampler2D tDepth;
  uniform mat4 uInverseProjection,uProjection,uCameraWorld;
  uniform vec2 uPixel;
  float depthAt(vec2 uv){ return texture2D(tDepth,uv).r; }
  bool onScreen(vec2 uv){return all(greaterThan(uv,vec2(.001)))&&all(lessThan(uv,vec2(.999)));}
  vec3 viewPosition(vec2 uv,float z){
    vec4 p=uInverseProjection*vec4(uv*2.-1.,z*2.-1.,1.);
    return p.xyz/p.w;
  }
  float eyeDepth(float z){return 1./(uInverseProjection[2].w*(z*2.-1.)+uInverseProjection[3].w);}
  vec2 screenPosition(vec3 p){vec4 c=uProjection*vec4(p,1.);return c.xy/c.w*.5+.5;}
  float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
  float hash(vec2 v){return fract(52.9829189*fract(dot(v,vec2(.06711056,.00583715))));}
`;

export const LIGHTING = `
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform vec3 uSun;
  uniform float uShafts;
  uniform int uAO;
  ${DEPTH}

  float occlusion(vec3 p,float raw){
    vec2 dx=vec2(uPixel.x*2.,0.),dy=vec2(0.,uPixel.y*2.);
    float dr=depthAt(vUv+dx), dl=depthAt(vUv-dx), dt=depthAt(vUv+dy), db=depthAt(vUv-dy);
    vec3 right=abs(dr-raw)<abs(dl-raw)?viewPosition(vUv+dx,dr)-p:p-viewPosition(vUv-dx,dl);
    vec3 top=abs(dt-raw)<abs(db-raw)?viewPosition(vUv+dy,dt)-p:p-viewPosition(vUv-dy,db);
    vec3 n=normalize(cross(right,top)+vec3(0.,0.,1e-7));
    float radius=mix(.56,1.35,smoothstep(3.,27.,-p.z));
    vec2 projected=vec2(uProjection[0].x,uProjection[1].y)*radius/max(1.,-p.z)*.5;
    projected=min(projected,vec2(.1,.14));
    float angle=hash(gl_FragCoord.xy)*1.5707963;
    float ao=0.;
    for(int d=0;d<4;d++){
      float a=angle+float(d)*1.5707963;
      vec2 dir=vec2(cos(a),sin(a))*projected;
      float horizon=0.;
      for(int j=1;j<=4;j++){
        if(uAO==1&&j>2)break;
        float stepSize=uAO==1?float(j)*.49:float(j)*.24;
        vec2 uv=vUv+dir*stepSize;
        if(!onScreen(uv))continue;
        float dep=depthAt(uv);
        if(dep>=.999999)continue;
        vec3 v=viewPosition(uv,dep)-p;
        float distance=length(v);
        float facing=max(0.,dot(n,v)/max(distance,.001)-.095);
        float falloff=1.-smoothstep(radius*.32,radius*1.25,distance);
        float obstruction=facing*falloff*smoothstep(.018,.07,distance);
        if(uAO==2) horizon=max(horizon,obstruction); else horizon+=obstruction*.55;
      }
      ao+=horizon;
    }
    return clamp(ao*.8,0.,.8)*(1.-smoothstep(28.,72.,-p.z))*smoothstep(.70,1.40,-p.z);
  }

  void main(){
    float raw=depthAt(vUv), eye=eyeDepth(raw);
    float ao=uAO>0&&raw<.999999&&eye>.68&&eye<72.?occlusion(viewPosition(vUv,raw),raw):0.;
    float shafts=0.;
    if(uSun.z>0.&&uShafts>0.){
      vec2 dir=uSun.xy-vUv;
      for(int i=1;i<=14;i++){
        float t=(float(i)-.55)/14.;
        vec2 uv=vUv+dir*t*.94;
        if(onScreen(uv)){
          float sky=step(.999999,depthAt(uv));
          float lit=smoothstep(.85,2.4,luma(texture2D(tScene,uv).rgb));
          shafts+=sky*lit*(.45+t*.55);
        }
      }
      shafts*=uSun.z*.10*exp(-1.55*dot(dir,dir))*uShafts;
    }
    gl_FragColor=vec4(ao,shafts,min(eye,650.),1.);
  }
`;

export const REFLECTION = `
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform float uWaterTime;
  uniform int uRaySteps;
  ${DEPTH}
  ${TEMPLE_WATER_GLSL}

  void main(){
    gl_FragColor=vec4(0.);
    float depth=depthAt(vUv);
    if(depth>=.999999)return;
    vec3 p=viewPosition(vUv,depth);
    if(-p.z>86.)return;
    vec3 world=(uCameraWorld*vec4(p,1.)).xyz;
    if(abs(world.y-${TEMPLE_WATER_Y})>.032)return;
    float bank=templeBank(world.xz);
    if(bank<-.02)return;
    vec2 slope=waterSlope(world.xz,uWaterTime);
    vec3 n=normalize(transpose(mat3(uCameraWorld))*normalize(vec3(slope.x,1.,slope.y)));
    vec3 incoming=normalize(p);
    vec3 ray=reflect(incoming,n);
    float fres=.03+.97*pow(1.-clamp(dot(-incoming,n),0.,1.),4.5);
    vec3 origin=p+n*.075;
    float previous=.15;
    float limit=min(26.,max(8.,-p.z*.96+9.));
    for(int i=1;i<=28;i++){
      if(i>uRaySteps)break;
      float a=float(i)/float(uRaySteps);
      float distance=mix(.22,limit,a*a);
      vec3 q=origin+ray*distance;
      if(q.z>-.15)break;
      vec2 uv=screenPosition(q);
      if(!onScreen(uv))break;
      float raw=depthAt(uv), gap=-q.z-eyeDepth(raw);
      if(raw<.999999&&gap>=0.&&gap<1.75){
        float lo=previous,hi=distance;
        for(int j=0;j<4;j++){
          float mid=(lo+hi)*.5;
          vec3 m=origin+ray*mid;
          vec2 sampleUv=screenPosition(m);
          if(-m.z>eyeDepth(depthAt(sampleUv)))hi=mid;else lo=mid;
        }
        q=origin+ray*hi; uv=screenPosition(q);
        raw=depthAt(uv); gap=-q.z-eyeDepth(raw);
        vec3 hit=(uCameraWorld*vec4(viewPosition(uv,raw),1.)).xyz;
        if(raw<.999999&&abs(gap)<.33&&hit.y>world.y+.085&&hi>.26){
          vec2 border=min(uv,1.-uv);
          float edge=smoothstep(0.,.12,min(border.x,border.y));
          float weight=edge*(1.-smoothstep(limit*.68,limit,hi))*smoothstep(0.,.28,bank);
          weight*=mix(.17,1.,fres)*(1.-smoothstep(52.,86.,-p.z));
          vec3 reflected=texture2D(tScene,uv).rgb*.69;
          gl_FragColor=vec4(min(reflected,vec3(6.))*weight,weight);
          return;
        }
      }
      previous=distance;
    }
  }
`;

export const METER = `
  varying vec2 vUv;
  uniform sampler2D tScene;
  void main(){
    vec3 col=texture2D(tScene,vUv).rgb;
    float l=max(.002,dot(col,vec3(.2126,.7152,.0722)));
    gl_FragColor=vec4(clamp((log2(l)+8.)/12.,0.,1.),0.,0.,1.);
  }
`;

export const ADAPT = `
  uniform sampler2D tMeter,tPrevious;
  uniform float uDelta,uReset;
  void main(){
    float logAverage=textureLod(tMeter,vec2(.5),5.).r*12.-8.;
    float target=clamp(1.+(-2.8-logAverage)*.075,.74,1.27);
    float prev=texture2D(tPrevious,vec2(.5)).r;
    float rate=target<prev?3.1:1.12;
    float e=mix(prev,target,max(uReset,1.-exp(-uDelta*rate)));
    gl_FragColor=vec4(e,0.,0.,1.);
  }
`;

export const COMPOSITE = `
  varying vec2 vUv;
  uniform sampler2D tDiffuse,tLighting,tReflection,tExposure;
  uniform float uAOAmount,uSSR,uShafts,uFlare,uAdapt;
  uniform vec2 uLightTexel;
  uniform vec3 uSun,uSunColor;
  ${DEPTH}

  void main(){
    vec3 col=texture2D(tDiffuse,vUv).rgb;
    if(uAOAmount>0.||uShafts>0.){
      float eye=eyeDepth(depthAt(vUv));
      vec4 z=texture2D(tLighting,vUv);
      float a=0., sum=0.;
      if(uAOAmount>0.){
        for(int i=0;i<4;i++){
          vec2 signCorner=vec2(i==0||i==2?-1.:1.,i<2?-1.:1.);
          vec4 s=texture2D(tLighting,vUv+signCorner*uLightTexel*.45);
          float w=exp(-abs(s.b-eye)*4./max(1.,eye*.09));
          sum+=w; a+=s.r*w;
        }
        col*=1.-min(.34,a/max(.008,sum)*uAOAmount*.79);
      }
      col+=uSunColor*z.g*.23;
    }
    if(uSSR>0.){
      float raw=depthAt(vUv);
      if(raw<.999999){
        vec3 wp=(uCameraWorld*vec4(viewPosition(vUv,raw),1.)).xyz;
        if(abs(wp.y-${TEMPLE_WATER_Y})<.031&&length(wp.xz)>19.&&length(wp.xz)<40.){
          vec4 r=texture2D(tReflection,vUv);
          col=mix(col,r.rgb/max(.001,r.a),r.a*uSSR*.9);
        }
      }
    }
    if(uSun.z>0.&&uFlare>0.&&onScreen(uSun.xy)){
      float sky=step(.999999,depthAt(uSun.xy));
      float vis=sky*smoothstep(1.25,5.,luma(texture2D(tDiffuse,uSun.xy).rgb))*uSun.z;
      vec2 d=(vUv-uSun.xy)*vec2(uPixel.y/uPixel.x,1.);
      float bloom=exp(-length(d)*17.)*.7+exp(-dot(d,d)*5500.)*.48;
      vec2 axis=vec2(.5)-uSun.xy;
      float ghost=0.;
      for(int i=1;i<4;i++){
        vec2 g=(vUv-uSun.xy-axis*(.68+float(i)*.53))*vec2(uPixel.y/uPixel.x,1.);
        float rad=length(g), ring=exp(-abs(rad-.020*float(i))*180.);
        ghost+=ring*.036+exp(-rad*64.)*.031;
      }
      col+=(uSunColor*bloom+vec3(.52,.78,.75)*ghost)*vis*uFlare;
    }
    if(uAdapt>0.)col*=mix(1.,texture2D(tExposure,vec2(.5)).r,uAdapt);
    gl_FragColor=vec4(col,1.);
  }
`;

export const GRADE = `
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float uTime,uVignette,uGrain,uFringe,uSaturation,uContrast,uWeak;
  uniform float uDOF,uMotion,uDistortion,uPanini,uSplit,uBalance,uWhitePoint;
  uniform vec3 uWhiteBalance,uTint,uLift,uGamma,uGain,uCurveRGB,uShadow,uHighlight,uMixR,uMixG,uMixB;
  uniform vec4 uCurve;
  uniform mat4 uPreviousVP;
  ${DEPTH}

  vec2 lens(vec2 uv){
    vec2 xy=(uv-.5)*2.;
    if(uPanini>0.){
      float d=uPanini;
      vec2 tanHalf=1./vec2(uProjection[0].x,uProjection[1].y);
      float c=inversesqrt(1.+tanHalf.x*tanHalf.x);
      float s=(d+1.)*c/(d+c);
      float x=xy.x*tanHalf.x*s;
      float a=d+1.;
      float t=x*a/(a+sqrt(max(.001,a*a-(d*d-1.)*x*x)));
      float cosTheta=(1.-t*t)/(1.+t*t);
      xy.x=(2.*t)/(1.-t*t)/tanHalf.x;
      xy.y*=s*(d+cosTheta)/(a*cosTheta);
    }
    if(abs(uDistortion)>.001){
      float r2=dot(xy,xy);
      xy*= (1.+uDistortion*r2*.26)/max(1.,1.+uDistortion*.52);
    }
    return clamp(xy*.5+.5,uPixel,1.-uPixel);
  }

  float channelCurve(float x,float mid){
    float a=(1.-mid*2.), b=(mid*2.);
    return x<.5 ? x*b : mid+(x-.5)*(1.+a);
  }
  float curve(float v){
    float x=clamp(v,0.,1.)*4.;
    float f=fract(x), segment=floor(x);
    if(segment<1.)return mix(uCurve.x,uCurve.y,f);
    if(segment<2.)return mix(uCurve.y,uCurve.z,f);
    if(segment<3.)return mix(uCurve.z,uCurve.w,f);
    return mix(uCurve.w,uWhitePoint,min(1.,x-3.));
  }

  void main(){
    vec2 uv=lens(vUv);
    vec2 centered=vUv-.5;
    float radial=length(centered), r2=dot(centered,centered);
    vec3 col=texture2D(tDiffuse,uv).rgb;
    if(uFringe>.00002){
      vec2 shift=(uv-.5)*uFringe*(.4+r2*3.8);
      col.r=texture2D(tDiffuse,uv+shift).r;
      col.b=texture2D(tDiffuse,uv-shift).b;
    }
    float raw=0.,eye=0.;
    if(uMotion>0.||uDOF>0.){raw=depthAt(uv);eye=eyeDepth(raw);}
    if(uMotion>0.&&eye>.78){
      vec3 wp=(uCameraWorld*vec4(viewPosition(uv,raw),1.)).xyz;
      vec4 before=uPreviousVP*vec4(wp,1.);
      if(before.w>0.){
        vec2 vel=clamp(uv-(before.xy/before.w*.5+.5),vec2(-.026),vec2(.026))*uMotion;
        if(length(vel)>uPixel.y){
          vec3 streak=col; float total=1.;
          for(int j=1;j<6;j++){
            vec2 p=clamp(uv-vel*float(j)*.18,uPixel,1.-uPixel);
            float w=1.-smoothstep(.3,2.+eye*.08,abs(eyeDepth(depthAt(p))-eye));
            streak+=texture2D(tDiffuse,p).rgb*w; total+=w;
          }
          col=streak/total;
        }
      }
    }
    float blur=uWeak*smoothstep(.06,.62,radial)*5.4;
    if(uDOF>0.&&eye>.72){
      float focus=clamp(eyeDepth(depthAt(vec2(.5,.512))),2.4,26.);
      float coc=abs(1./max(.7,eye)-1./focus);
      blur+=uDOF*min(coc*16.,5.5)*smoothstep(.72,1.45,eye);
    }
    if(blur>.28){
      vec3 soft=col*2.;
      for(int i=0;i<8;i++){
        float a=float(i)*.785398;
        vec2 sampleUv=uv+vec2(cos(a),sin(a))*uPixel*blur;
        soft+=texture2D(tDiffuse,sampleUv).rgb;
      }
      col=soft*.1;
    }
    col*=uTint*uWhiteBalance;
    col=mix(vec3(luma(col)),col,uSaturation);
    col=(col-.5)*uContrast+.5;
    col+=uLift*(1.-clamp(col,0.,1.));
    col=pow(max(col,0.),1./uGamma)*uGain;
    col=vec3(dot(col,uMixR),dot(col,uMixG),dot(col,uMixB));
    col=vec3(curve(col.r),curve(col.g),curve(col.b));
    col=vec3(channelCurve(col.r,uCurveRGB.r),channelCurve(col.g,uCurveRGB.g),channelCurve(col.b,uCurveRGB.b));
    if(uSplit>0.){
      float range=smoothstep(.16,.85,luma(col)+uBalance*.28);
      vec3 tint=mix(uShadow,uHighlight,range);
      col*=mix(vec3(1.),tint/max(luma(tint),.08),uSplit*.60);
    }
    col*=1.-uVignette*smoothstep(.18,.73,radial);
    col=mix(col,vec3(luma(col)),uWeak*.29);
    col*=1.-uWeak*(.08+.63*smoothstep(.07,.68,radial));
    col+=(hash(gl_FragCoord.xy+floor(uTime*29.)*vec2(17.,11.))-.5)*uGrain*(.36+.64*sin(clamp(luma(col),0.,1.)*3.14159));
    gl_FragColor=vec4(clamp(col,0.,1.),1.);
  }
`;
