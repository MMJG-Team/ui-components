import { useEffect, useRef, useState } from "react";
import { Masonry } from "@mmjg/ui-components";
import { type ImageRecord, ImageModel } from "@mmjg/ui-components";
import { fetchImages } from "@components/Masonry/demo/utils";

const Card = (props: { data: ImageRecord<{ id: string | number }> }) => {
    return (
        <div
            key={props.data.id}
            style={{
                boxSizing: "border-box",
                fontSize: 0,
                width: "100%",
                height: "100%",
            }}
        >
            <img
                alt="kitty"
                src={props.data.src}
                width={"100%"}
                height={"100%"}
            />
        </div>
    );
};

export default function Responsive() {
    const [items, setItems] = useState<
        ImageRecord<{ id: string; name: string }>[]
    >([]);

    const imageModelRef = useRef<ImageModel<{ id: string; name: string }>>(
        new ImageModel(),
    );

    const initImages = async () => {
        const images = await fetchImages();

        await imageModelRef.current.loadRecords(images);

        setItems(imageModelRef.current.getRecords());
    };

    useEffect(() => {
        initImages();
    }, []);

    return (
        <div
            style={{
                height: "500px",
                resize: "horizontal",
            }}
        >
            <Masonry
                items={items}
                breakPointConfig={{
                    1560: 6,
                    1280: 5,
                    960: 4,
                    720: 3,
                    480: 2,
                    0: 1,
                }}
                gap={8}
                itemRender={({ item }) => <Card data={item} />}
            />
        </div>
    );
}
