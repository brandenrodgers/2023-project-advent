import React, { useState } from "react";
import {
  Divider,
  Flex,
  Button,
  Form,
  Image,
  Input,
  hubspot,
} from "@hubspot/ui-extensions";
import GiftCarousel from "./GiftCarousel";

hubspot.extend(() => <EphemeralWishList />);

const EphemeralWishList = () => {
  const [item, setItem] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [wishList, setWishList] = useState([]);

  const addItem = () => {
    setWishList([...wishList, { item, image, link }]);
    setItem("");
    setImage("");
    setLink("");
  };

  const deleteItem = (item) => {
    const targetIndex = wishList.findIndex(({ item: i }) => item === i);
    const firstArr = wishList.slice(0, targetIndex);
    const secondArr = wishList.slice(targetIndex + 1);
    setWishList([...firstArr, ...secondArr]);
  };

  return (
    <>
      <Flex direction="column" align="center" gap="small">
        <Image
          src="https://www.freewebheaders.com/wp-content/gallery/christmas/illustrative-christmas-bells-website-header.jpg"
          width={600}
          height={130}
        />
        <Form preventDefault={true}>
          <Flex direction="column" align="center" gap="small">
            <Flex direction="row" justify="center" align="end" gap="small">
              <Input
                name="text"
                required={true}
                label="Gift"
                value={item}
                onInput={(t) => setItem(t)}
              />
              <Input
                name="text"
                label="Image"
                value={image}
                onInput={(t) => setImage(t)}
              />
              <Input
                name="text"
                label="Link"
                value={link}
                onInput={(t) => setLink(t)}
              />
            </Flex>
            <Button type="submit" disabled={!item} onClick={addItem}>
              Add
            </Button>
          </Flex>
        </Form>
      </Flex>

      <Divider />
      <GiftCarousel wishList={wishList} onDeleteItem={deleteItem} />
    </>
  );
};
