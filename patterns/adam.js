// adam - mon fragment du cadavre exquis
await initHydra({feedStrudel:1})
//
src(s0).kaleid(H("<4 5 6>"))
.diff(osc(1,0.5,5))
.modulateScale(osc(2,-0.25,1))
.out()
//

$: s("bd*4,[hh:0:<.5 1>]*8,~ rim").bank("RolandTR909").speed(.9)

$: note("[<g1!3 <bb1 <f1 d1>>>]*3").s("sawtooth")

setcpm(40)
$:stack(
  note("<[36 48]*4 [34 46]*4 [41 53]*4 [39 51]*4>")
  .sound("gm_acoustic_bass"),
  sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
  .bank("RolandTR909")
)
$: n("0 [2 4] <3 5> [~ <4 1>]".add("<0 [0,2,4]>"))
.scale("C5:minor")
.sound("gm_xylophone")
.room(.4).delay(.125)
$: note("c2 [eb3,g3]".add("<0 <1 -1>>"))
.adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass")
.room(.5)
$: n("0 1 [2 3] 2").sound("jazz").jux(rev)

.room(.75).sometimes(add(note(12))).clip(.3)
.lpa(.05).lpenv(-4).lpf(2000).lpq(8).ftype('24db')

all(x=>x.fft(4).scope({pos:0,smear:.95}))

