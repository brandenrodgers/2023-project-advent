import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Divider,
  Flex,
  Button,
  Form,
  Image,
  Input,
  TextArea,
  Panel,
  hubspot,
} from "@hubspot/ui-extensions";
import GiftCarousel from "./GiftCarousel";

hubspot.extend(({ actions, runServerlessFunction }) => {
  return (
    <WishList
      fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
      runServerless={runServerlessFunction}
    />
  );
});

const WishList = ({ fetchCrmObjectProperties, runServerless }) => {
  // Initialization state
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(true);
  const tableId = useRef(null);
  const tableColumnMap = useRef(null);
  const [error, setError] = useState(null);

  // Other state
  const [item, setItem] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [wishList, setWishList] = useState([]);
  const [panelItem, setPanelItem] = useState({});

  useEffect(() => {
    fetchCrmObjectProperties(["firstname"]).then(({ firstname }) => {
      setContactName(firstname);
    });
  }, []);

  useEffect(() => {
    if (contactName) {
      runServerless({ name: "createWishListTable" }).then((resp) => {
        responseHandler(resp, ({ table }) => {
          tableId.current = table.id;
          tableColumnMap.current = table.columns
            .filter((c) => c.name !== "name")
            .reduce((acc, c) => {
              acc[c.name] = c.id;
              return acc;
            }, {});
          refreshWishList();
        });
      });
    }
  }, [contactName]);

  useEffect(() => {
    if (panelItem) {
      console.log("Opening panel for: ", panelItem);
    }
  }, [panelItem]);

  const responseHandler = ({ response }, callback) => {
    if (response.success) {
      callback(response);
    } else if (response.error) {
      if (typeof response.error === "string") {
        setError(response.error);
      } else {
        setError(response.error.message);
      }
    }
  };

  const refreshWishList = () => {
    runServerless({
      name: "getUserWishListItems",
      parameters: {
        contactName,
        tableId: tableId.current,
        tableColumnMap: tableColumnMap.current,
      },
    }).then((resp) => {
      responseHandler(resp, ({ items }) => {
        setWishList(items);
        if (loading) {
          setLoading(false);
        }
      });
    });
  };

  const addItem = () => {
    runServerless({
      name: "addWishListItem",
      parameters: {
        contactName,
        tableId: tableId.current,
        tableColumnMap: tableColumnMap.current,
        item,
        image,
        link,
        description,
      },
    }).then((resp) => {
      responseHandler(resp, refreshWishList);
    });
    setItem("");
    setImage("");
    setLink("");
    setDescription("");
  };

  const deleteItem = (item) => {
    runServerless({
      name: "removeWishListItem",
      parameters: {
        contactName,
        tableId: tableId.current,
        item,
      },
    }).then((resp) => {
      responseHandler(resp, refreshWishList);
    });
  };

  const handleOpenPanel = (item, openPanel) => {
    const targetItem = wishList.find(({ item: i }) => item === i);
    setPanelItem(targetItem);
    openPanel("notes-panel");
  };

  const renderPanel = () => {
    return (
      <Panel
        id="notes-panel"
        title={`Notes for ${panelItem.item}`}
        onClose={() => setPanelItem({})}
      >
        {panelItem.description}
      </Panel>
    );
  };

  return (
    <>
      {renderPanel()}
      <Flex direction="column" align="center" gap="small">
        <Image
          src="https://www.freewebheaders.com/wp-content/gallery/christmas/illustrative-christmas-bells-website-header.jpg"
          width={600}
          height={130}
        />
        {error ? (
          <Alert title="Error" variant="error">
            {error}
          </Alert>
        ) : null}
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
            <TextArea
              label="Description"
              name="description"
              value={description}
              cols={50}
              onInput={(t) => setDescription(t)}
            />
            <Button type="submit" disabled={!item} onClick={addItem}>
              Add
            </Button>
          </Flex>
        </Form>
      </Flex>

      <Divider />
      <GiftCarousel
        wishList={wishList}
        onDeleteItem={deleteItem}
        onOpenPanel={handleOpenPanel}
        loading={loading}
      />
    </>
  );
};
