import img0 from '../../../assets/images/6ngpy01e30n.png';
import img1 from '../../../assets/images/ob0pj8yemta.png';
import img2 from '../../../assets/images/s6rnozshh4q.png';
import img3 from '../../../assets/images/wvikznujtjs.png';
import img4 from '../../../assets/images/76pz539bjpl.png';
import img5 from '../../../assets/images/mqznq6id48j.png';
import img6 from '../../../assets/images/t2c13t1n39c.png';
import img7 from '../../../assets/images/aiasybwz0w7.png';
import img8 from '../../../assets/images/7oqqxvronh6.png';
import img9 from '../../../assets/images/h86yda092tj.png';
import img10 from '../../../assets/images/lwrw17ka0sn.png';
import img11 from '../../../assets/images/bm7nmy0wms.png';
import img12 from '../../../assets/images/y4f6w5z56m.png';
import img13 from '../../../assets/images/v7d3ze6n8xc.png';
import img14 from '../../../assets/images/jjqx70ec7u.png';
import img15 from '../../../assets/images/j5wl8e6m4dg.png';
import img16 from '../../../assets/images/vzo2j9wng1h.png';
import img17 from '../../../assets/images/rpguuevbzlo.png';
import img18 from '../../../assets/images/k8skyp4f7y.png';
import img19 from '../../../assets/images/4ow85jgjqgk.png';
import img20 from '../../../assets/images/fg9gzetbjmn.png';
import img21 from '../../../assets/images/viizpc7qtr.png';
import img22 from '../../../assets/images/e9gs2co2bnr.png';
import img23 from '../../../assets/images/r8rog5o1oia.png';
import img24 from '../../../assets/images/1yagh001l5m.png';
import img25 from '../../../assets/images/zr3j9uy9gck.png';
import img26 from '../../../assets/images/umi5xwkop9a.png';
import img27 from '../../../assets/images/bl6guvml8vh.png';
import img28 from '../../../assets/images/1kilu1acj8j.png';
import img29 from '../../../assets/images/4tt2an5zgh8.png';
import img30 from '../../../assets/images/fhbc0hcu22l.png';
import img31 from '../../../assets/images/kiad3blx6o.png';
import img32 from '../../../assets/images/jpy2i8mkoi.png';
import img33 from '../../../assets/images/zr1yqzeb7cc.png';
import img34 from '../../../assets/images/li0lthqpig.png';
import img35 from '../../../assets/images/b7wh7wksnle.png';
import img36 from '../../../assets/images/olllz8q0mub.png';
import img37 from '../../../assets/images/4mip631qp9s.png';
import img38 from '../../../assets/images/guboy1d3el7.png';
import img39 from '../../../assets/images/gmg5ql98zz.png';
import img40 from '../../../assets/images/0crov18s2jyn.png';
import img41 from '../../../assets/images/0mi7y196x1e.png';
import img42 from '../../../assets/images/3kmddbf9v1w.png';
import img43 from '../../../assets/images/gs8nr42k3mj.png';
import img44 from '../../../assets/images/wwly0l6rlhh.png';
import img45 from '../../../assets/images/fcdp1xp4w1d.png';
import img46 from '../../../assets/images/anuuis1ts8e.png';
import img47 from '../../../assets/images/v9al3bwlicl.png';

export const IMAGES = [
    img0, img1, img2, img3, img4, img5, img6, img7, img8, img9,
    img10, img11, img12, img13, img14, img15, img16, img17, img18, img19,
    img20, img21, img22, img23, img24, img25, img26, img27, img28, img29,
    img30, img31, img32, img33, img34, img35, img36, img37, img38, img39,
    img40, img41, img42, img43, img44, img45, img46, img47,
];

export const fetchImages = async (count: number = 5000) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const items = Array.from(Array(count), (_, i) => ({
        id: Math.random().toString(36).substring(2),
        name: `Kitty ${i}`,
        src: IMAGES[Math.floor(Math.random() * IMAGES.length)],
    }));

    return items;
};

export default IMAGES