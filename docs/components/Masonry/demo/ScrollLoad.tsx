import { useEffect, useRef, useState } from "react";
import { Masonry } from "ui-components";
import { type ImageRecord, ImageModel } from "ui-components";
import { fetchImages } from "./utils";

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

export default function ScrollLoad() {
    const [items, setItems] = useState<
        ImageRecord<{ id: string; name: string }>[]
    >([]);

    const imageModelRef = useRef<ImageModel<{ id: string; name: string }>>(
        new ImageModel(),
    );

    const fetctMoreImages = async () => {
        const images = await fetchImages(50);

        await imageModelRef.current.loadRecords(images);

        const newItems = imageModelRef.current.getRecords();

        setItems([...newItems]);
    };

    const onLoadMore = async () => {
        await fetctMoreImages();
    };

    useEffect(() => {
        fetctMoreImages();
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
                columnCount={10}
                gap={8}
                itemRender={({ item }) => <Card data={item} />}
                loadMoreThreshold={100}
                onLoadMore={onLoadMore}
            />
        </div>
    );
}
