import { useEffect, useRef, useState } from "react";
import { Masonry } from "@mmjg/ui-components";
import { type ImageRecord, ImageModel } from "@mmjg/ui-components";
import { fetchImages } from "@demo/components/Masonry/utils";

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

export default function DynamicLoad() {
    const [items, setItems] = useState<
        ImageRecord<{ id: string; name: string }>[]
    >([]);

    const imageModelRef = useRef<ImageModel<{ id: string; name: string }>>(
        new ImageModel(),
    );

    const fetctMoreImages = async () => {
        const images = await fetchImages(10);

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
        <div>
            <button
                style={{
                    padding: "4px 16px",
                    fontSize: "14px",
                    color: "#fff",
                    backgroundColor: "var(--rp-c-link)",
                    border: "none",
                    borderRadius: "4px",
                    marginBottom: "16px",
                    cursor: "pointer",
                }}
                onClick={() => onLoadMore()}
            >
                加载更多
            </button>
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
                />
            </div>
        </div>
    );
}
