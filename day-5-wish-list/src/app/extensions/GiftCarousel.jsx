import React, { useEffect, useRef, useState } from "react";
import {
  Divider,
  Heading,
  Flex,
  LoadingSpinner,
  Box,
  Link,
  Button,
  Image,
  Tile,
  Text,
} from "@hubspot/ui-extensions";

const ITEMS_TO_SHOW = 3;
const DEFAULT_IAMGE =
  "https://img.freepik.com/premium-vector/christmas-gift-box-cartoon-vector-christmas-present_520417-529.jpg?w=2000";

const GiftCarousel = ({ wishList, loading, onDeleteItem, onOpenPanel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevWishListLength = useRef(wishList.length);

  useEffect(() => {
    const currentLength = wishList.length;

    if (
      currentLength > prevWishListLength.current &&
      currentLength > ITEMS_TO_SHOW
    ) {
      setCurrentIndex(currentLength - ITEMS_TO_SHOW);
    }
    prevWishListLength.current = currentLength;
  }, [wishList]);

  const scrollCarousel = (operator) => {
    const newIndex = currentIndex + operator;

    if (newIndex < 0) {
      setCurrentIndex(wishList.length - 1);
    } else if (newIndex >= wishList.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(newIndex);
    }
  };

  const renderItem = (wishListItem, i) => {
    const { item, image, link, description } = wishListItem;
    return (
      <Tile key={i}>
        <Flex
          direction="column"
          justify="center"
          align="center"
          gap="extra-small"
        >
          <Heading>{item}</Heading>
          <Image src={image || DEFAULT_IAMGE} width={75} height={75} />
          <Flex justify="center" gap="extra-small">
            {description ? (
              <Link
                onClick={(e, reactions) =>
                  onOpenPanel(item, reactions.openPanel)
                }
              >
                Notes
              </Link>
            ) : null}
            {description && link ? <Text>|</Text> : null}
            {link ? <Link href={link}>view</Link> : null}
          </Flex>
          <Button
            onClick={() => onDeleteItem(item)}
            variant="destructive"
            size="extra-small"
            type="button"
          >
            Remove
          </Button>
        </Flex>
      </Tile>
    );
  };

  const renderItems = () => {
    return (
      <Flex direction="row" justify="center" gap="extra-small">
        {wishList
          .filter(
            (x, i) => currentIndex <= i && i < currentIndex + ITEMS_TO_SHOW
          )
          .map(renderItem)}
        {wishList
          .filter((x, i) => {
            if (currentIndex <= i && i < currentIndex + ITEMS_TO_SHOW) {
              return false;
            }
            // Render any items from the front of the array
            const lastIndex = currentIndex + ITEMS_TO_SHOW - 1;
            const overflow =
              lastIndex >= wishList.length ? lastIndex % wishList.length : -1;
            return i <= overflow;
          })
          .map(renderItem)}
      </Flex>
    );
  };

  if (!wishList || !wishList.length) {
    if (loading) {
      return (
        <Flex justify="center">
          <LoadingSpinner size="md" />
        </Flex>
      );
    }
    return (
      <Flex justify="center">
        <Heading>Wish list is empty</Heading>
      </Flex>
    );
  }

  return (
    <>
      <Flex direction="row" align="center" gap="small">
        {wishList.length > ITEMS_TO_SHOW ? (
          <Box>
            <Button
              onClick={() => scrollCarousel(-1)}
              variant="primary"
              size="extra-small"
              type="button"
            >
              {"<"}
            </Button>
          </Box>
        ) : null}

        {renderItems()}
        {wishList.length > ITEMS_TO_SHOW ? (
          <Box>
            <Button
              onClick={() => scrollCarousel(1)}
              variant="primary"
              size="extra-small"
              type="button"
            >
              {">"}
            </Button>
          </Box>
        ) : null}
      </Flex>
      <Divider />
    </>
  );
};

export default GiftCarousel;
