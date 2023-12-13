import React, { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  Image,
  LoadingSpinner,
  Text,
  hubspot,
  Divider,
} from "@hubspot/ui-extensions";
import { INIT_STATUSES, useHSInit } from "./hsInitHook";

hubspot.extend(({ actions, runServerlessFunction }) => (
  <CoalForChristmas
    runServerless={runServerlessFunction}
    fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
  />
));

const naughtyOrNiceProperty = {
  name: "naughty_or_nice",
  label: "Naughty or Nice",
  groupName: "contactinformation",
  type: "number",
};

const COAL = {
  imgSrc:
    "https://t4.ftcdn.net/jpg/00/65/69/55/360_F_65695565_me55LzXSpn4NcFYUKQYx8BwWB12R3xAg.jpg",
  isPresent: false,
  isOpen: false,
};

const GIFT = {
  imgSrc: null,
  isPresent: true,
  isOpen: false,
};

const GIFTS = [
  "https://hips.hearstapps.com/hmg-prod/images/golf-clubs-1614721390.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*",
  "https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/81ZAFtFWo-L._AC_UF894,1000_QL80_.jpg",
  "https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/61xySkZCAtL._AC_UF1000,1000_QL80_.jpg",
  "https://assetsio.reedpopcdn.com/playstation-5-review-digitalfoundry-1604678146723.jpg?width=1200&height=900&fit=crop&quality=100&format=png&enable=upscale&auto=webp",
];

const CoalForChristmas = ({ fetchCrmObjectProperties, runServerless }) => {
  const [contactName, setContactName] = useState(null);
  const [isNice, setIsNice] = useState(null);
  const [propsLoading, setPropsLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [gameBoard, setGameBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initStatus = useHSInit(runServerless, {
    properties: [{ objectType: "contacts", options: naughtyOrNiceProperty }],
  });

  useEffect(() => {
    if (initStatus.status === INIT_STATUSES.SUCCESS) {
      fetchCrmObjectProperties(["firstname", "naughty_or_nice"]).then(
        ({ firstname, naughty_or_nice }) => {
          setContactName(firstname);
          setIsNice(naughty_or_nice ? parseInt(naughty_or_nice) : null);
          setPropsLoading(false);
        }
      );
    }
  }, [fetchCrmObjectProperties, initStatus.status]);

  const getRandomGift = () => {
    const randomIndex = Math.floor(Math.random() * GIFTS.length);
    return {
      ...GIFT,
      imgSrc: GIFTS[randomIndex],
    };
  };

  const resetBoard = () => {
    const randomIndex = Math.floor(Math.random() * 3);

    const newGameBoard = [0, 1, 2].map((index) => {
      if (isNice) {
        return index === randomIndex ? { ...COAL } : getRandomGift();
      } else {
        return index === randomIndex ? getRandomGift() : { ...COAL };
      }
    });

    setGameBoard(newGameBoard);
  };

  const resetGame = () => {
    resetBoard();
    setScore(0);
    setStarted(true);
    setGameOver(false);
  };

  const handlePresentClick = (coalOrGift, i) => {
    const newGameBoard = [...gameBoard];
    newGameBoard[i].isOpen = true;
    setGameBoard(newGameBoard);

    if (coalOrGift.isPresent) {
      setScore(score + 1);

      setTimeout(() => {
        resetBoard();
      }, 1200);
    } else {
      setGameOver(true);
    }
  };

  const renderHeader = () => {
    if (typeof isNice !== "number") {
      return (
        <Heading>
          Santa does not know if {contactName} is naughty or nice yet, so you
          cannot play the game.
        </Heading>
      );
    }
    const message = isNice
      ? "nice, so only one present contains coal"
      : "naughty, so two of the presents contain coal";
    return (
      <Heading>
        Santa knows {contactName} is {message}
      </Heading>
    );
  };

  const renderCoalOrGift = (coalOrGift, i) => {
    return (
      <Image
        key={i}
        src={
          coalOrGift.isOpen
            ? coalOrGift.imgSrc
            : "https://cdn-icons-png.flaticon.com/512/3692/3692220.png"
        }
        onClick={() => handlePresentClick(coalOrGift, i)}
        width={100}
      />
    );
  };

  const renderGameBoard = () => {
    if (typeof isNice !== "number") {
      return (
        <Text>
          Use the Naughty or Nice extension to mark {contactName} as naughty or
          nice.
        </Text>
      );
    }

    return (
      <Flex justify="center" align="center" gap="lg">
        {gameBoard.map(renderCoalOrGift)}
      </Flex>
    );
  };

  if (propsLoading || initStatus.status === INIT_STATUSES.PENDING) {
    return (
      <Flex justify="center" align="center" gap="md">
        <LoadingSpinner label="Loading..." />
      </Flex>
    );
  }
  if (initStatus.status === INIT_STATUSES.FAILED) {
    return <Text>Error initializing: {initStatus.error}</Text>;
  }

  return (
    <Flex direction="column" justify="center" align="center" gap="md">
      <Text>
        Choose one of the three presents to open. Be careful though. Some of the
        presents contain gifts, but others contain coal! Change the difficulty
        using the Naughty or Nice extension. Naughty contacts will have more
        coal than ncie ones!
      </Text>
      <Divider />
      {renderHeader()}
      {renderGameBoard()}
      <Button
        onClick={resetGame}
        disabled={typeof isNice !== "number" || (started && !gameOver)}
        variant="primary"
        type="button"
      >
        {started ? "Restart" : "Start"}
      </Button>
      {gameOver ? <Heading>You chose the coal. Game over...</Heading> : null}
      {started ? <Text>Current streak: {score}</Text> : null}
    </Flex>
  );
};
