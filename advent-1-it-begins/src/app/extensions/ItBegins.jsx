import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Heading,
  Text,
  ProgressBar,
  Tile,
  hubspot,
  Flex,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context }) => <ItBegins context={context} />);

const ItBegins = ({ context }) => {
  const [daysTilChristmas, setDaysTilChristmas] = useState();

  useEffect(() => {
    updateDaysTilChristmas();
  }, []);

  const updateDaysTilChristmas = () => {
    let today = new Date();
    let christmasYear = today.getFullYear();

    if (today.getMonth() == 11 && today.getDate() > 25) {
      christmasYear = christmasYear + 1;
    }

    let christmasDate = new Date(christmasYear, 11, 25);
    let dayMilliseconds = 1000 * 60 * 60 * 24;

    let remainingDays = Math.ceil(
      (christmasDate.getTime() - today.getTime()) / dayMilliseconds
    );

    setDaysTilChristmas(remainingDays);
  };

  return (
    <>
      <Heading>Happy Holidays {context.user.firstName}!</Heading>
      <Divider />
      <ProgressBar
        value={25 - daysTilChristmas}
        maxValue={25}
        showPercentage={true}
        valueDescription={`Only ${daysTilChristmas} days to go til Christmas!`}
      />
      <Button onClick={updateDaysTilChristmas}>Refresh</Button>
    </>
  );
};
