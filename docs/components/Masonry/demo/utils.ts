const IMAGES = [
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/13c2f792e0a243f894d90e7d7e68023b~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=QDkkKR5DUjqDQdq1czyDJfDUcaY%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/45f763c9290b4af7bcb24cc429673262~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=3oG2eqX75nYfBxTJONVdXwZJr3A%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/d202d97340d14394a68bf47ef8871f99~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=Xy%2B6u%2FixTRFlTsJJ9ZWuczgRQaY%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/a4f743c907f544379d5548c1cdb7bf72~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=yqt4FjQ1PI1uB939IC%2FTatvJcQ8%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/95a34cf9813b45dbbfc669200f9e34fe~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=Wew5yB0dQzVzrVdzlvAiOUl3ya0%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/5d5e5acd3f8349f1a908ee0f1fe5912c~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=ecIS6BINO88yrEq5dDCY%2FuOtt2o%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/5be253813ad34bb7a69f2e25dc173e6b~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=Yau6sBJKqSoSoo%2BMkpfVSGPNLdU%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/5949f70b767c4920ba78f93b53e3b1a5~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=ldmVm729f2XFIB4RycvEi8BF%2B8o%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/27732509334a47ada6dff4ef1aa86dad~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=k0UKblpztLhABMMXh3XNkmTxxq4%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/a5ea8b755d0b4a7a86b04d8466994415~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=AnlhQ2EU%2BOKcgRVQ1AxaIoqFjaE%3D",
    "https://p26-passport.byteacctimg.com/img/mosaic-legacy/3793/3131589739~120x256.image",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/e3c63f538bee47cb936436a05113fe97~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=7ZeqmATtsRyamwJzdWNMOAjbSSs%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/9bc3bc4eb21d428cb63b92bb2b3c9e66~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=8XBaenTE2feNGPeymMUWEVbsDqY%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/64244b31d2b4489c8c273f2f1ebb98b7~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=6DnI5D4UaNIhzMBMaiuLevfsSRM%3D",
    "https://p9-passport.byteacctimg.com/img/user-avatar/d3f57c0a436514611d68b932c05910a1~300x300.image",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/9c5348e1f89d408680f2a5ec5ff3d1d0~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=8qyWer885D2XwfUTHJavijFxv6o%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/ab3c8054380a447688220cece789ee45~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=AjjDUhTzW3Hu0J5S1lZvBDxUUv8%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/766125e77d724ae690de1566d1b2d1bc~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=xIGSEjw%2BILychFaYYvtVEf7Ga2A%3D",
    "https://p6-faceu-img-sign.byteimg.com/tos-cn-i-tb4s082cfz/fe0c9ce2e44e451d9e21e57a88fbe5f7~tplv-resize:200:200.webp?lk3s=4eecb9e8&x-expires=1765511477&x-signature=VlwSkf7SOwp86ZWIvL%2BIukFpk5A%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/9ce57171921e4319972cd12db43810cf~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=RRXl35qVzh1BDSuFKZ97tdO2Yuc%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/b29649b4e95d4dd18e5c2ebd75c5d7ec~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=xO9UKo0ZCH9%2Bgvxm5V3tH1qjrtU%3D",
    "https://p3-faceu-img-sign.byteimg.com/tos-cn-i-tb4s082cfz/29beb6190d1b43d5956addc40cc336c8~tplv-resize:200:200.webp?lk3s=4eecb9e8&x-expires=1765511477&x-signature=58vY6EkfWULgKTXqeBdRgq6mv4A%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/efddc3002d494615abb8a73b6be6a18d~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=bwKkXNyYwg98izSxUHd9d1Xp6Eo%3D",
    "https://p6-faceu-img-sign.byteimg.com/tos-cn-i-tb4s082cfz/bc5a51f94a134d0faa6209fd332e4c76~tplv-resize:200:200.webp?lk3s=4eecb9e8&x-expires=1765511477&x-signature=PkyRnibRVDD3Fv9Z8VUZUiPq2uM%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/6e80ac4306e0495ba5ad10ce48895b1e~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=F5Rw%2FAxoltNWvU8MIV%2FrB8dhbMU%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/e871a03a34d04ee7b4b19dc11198e5cd~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=IzDcKTHA3k5Ru9GXT1B1YrXGI0M%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/d8f47b134f27450abc51894550f7456d~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=FGXh%2FjG8Tgkn3MSUI6rAwONeKlo%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/42b5ec1c73bf48ad92f43d161f4242cb~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=4JWjqwv%2Fh0lvgSqFseNMZR%2BWQUw%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/d0965d244c324a5cb2ad247d80e68fe3~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=8r3dwBLbNa0UqN%2Fw4VsSDLAwZU8%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/9cabe8a5b2e84ab8ac43c7b3b13adeca~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=Y2jfMZ9DS%2F7pqyVtr3kdG72HR8A%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/a184f637f8f54268be360f682de573fe~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=2gruNxuYb%2F6ZM6vcHnM8ggdjTB8%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/48a7d19e4cae4a818975c01dbe796e68~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=cjwyf4z0djGRCYPuqhFTGmr80d4%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/20cd8f85718846c1b22a04d344bd60ba~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=bCFPY1P%2B9KbAcj2ZOG%2F40g6IRkA%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/f78f93fc165644b89348ddb7926964d0~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=JyIy%2BOb1ElIboLMssQaOuU5gvHE%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/b1501ba6b3a3463285e9ffd86dc47c27~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=nkN5hJo2RuXOMpvkkcE7ZOKMmF4%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/cae879afc2f84370a1e252fb1bf73d0d~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=lwKzsImBOMXL2vvvEYIbQqDJku4%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/e3522f1ba14a4960b5b8c151be1dd7ed~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=HWSW4w5S2F4L%2FHy%2BGEnwnFq%2B8SY%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/908b7cd8fba04d448fd13ad0b2c7e146~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=rWAVIKbdqQiv2uGcmOePyxKPbgo%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/0f188748ad0d495391579ff665c60be2~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=lDO1yMkVPI9GhQn%2F0qHnwMIRDQc%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/6e6cd54e16e24069b90592420a450102~tplv-tb4s082cfz-aigc_resize_loss:720:720.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=amTrzD6IUZrbMvtQzxkFWUYMyaA%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/8aaa9f4285db446ab8814124b6593029~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=z5no7%2BX4KDoraAg3Rqg5lGrHMl4%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/deae385715584c008b38c05e57635de1~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=Op%2FFm3eTpp%2FPB6ZY4yKEHVbNsM4%3D",
    "https://p3-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/befa6b9535c24fbfb0bd6074fb91e0c4~tplv-tb4s082cfz-aigc_resize_loss:900:900.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=%2Br3%2FCfpky3Ylq2XE6TvALP%2BDIwM%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/f3ed49f14fb544f58e398750819225df~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=NYoV4vIE4koLB3hpTMMoQTgp0dg%3D",
    "https://p26-dreamina-sign.byteimg.com/tos-cn-i-tb4s082cfz/2021b7752af14fd3824f21f35005fcc3~tplv-tb4s082cfz-aigc_resize_loss:480:480.webp?lk3s=4fa96020&x-expires=1765152000&x-signature=92BE81i4HfFhhYMUXE6N%2BZEp9bk%3D"
]

export const fetchImages = async (count: number = 5000) => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const items = Array.from(Array(count), (_, i) => ({
        id: Math.random().toString(36).substring(2),
        name: `Kitty ${i}`,
        src: IMAGES[Math.floor(Math.random() * IMAGES.length)]
    }))

    return items
}