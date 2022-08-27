import "./App.css";
import "animate.css";
import { useState, useEffect } from "react";

import namehash from "eth-ens-namehash";
import { Keccak } from "sha3";
//import axiosClient from "axios"; // DO NOT REMOVE COMMENT

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";

import OpenSeaIcon from "./asset/image/opensea-icon.svg";
import EnsIcon from "./asset/image/ens-icon.jpeg";
import GithubIcon from "./asset/image/github-icon.svg";
import TwitterIcon from "./asset/image/twitter-icon.svg";
import WebsiteIcon from "./asset/image/website-icon.png";
import GemXyzIcon from "./asset/image/gemxyz-icon.jpeg";

import { EnsContract, hexToDec, textRecordToUrl } from "./utility";

var ensContract = new EnsContract();

/* vanilla js to adapt height to actual viewport vs therotical */
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);

window.addEventListener("resize", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});
/* end vanilla js */

function App() {
  const [seconds, setSeconds] = useState("00");
  const [currentEnsImage, setCurrentEnsImage] = useState("");
  const [currentEnsMetadata, setCurrentEnsMetadata] = useState({
    url: "",
    twitter: "",
    github: "",
  });
  const ensImages = {};

  const gemxyzLink =
    "https://www.gem.xyz/collection/ens/?filters=%7B%22custom%22:%5B%2224h%22%5D%7D";

  useEffect(() => {
    setSeconds(getSeconds());
    setInterval(() => {
      if (getSeconds() === "59") {
        getEnsMetadata(getEnsName(1));
      }
      setSeconds(getSeconds());
      setCurrentEnsImage(ensImages[getEnsName()]);
    }, 1000);
    preloadImages();
    getEnsMetadata(getEnsName());
    // eslint-disable-next-line
  }, []);

  const preloadImages = async () => {
    // load all ens names for next 1000 minutes
    const ensNames = [getEnsName()];
    for (let i = 1; i <= 1000; i++) {
      ensNames.push(getEnsName(i));
    }

    // load images for each ens name
    await downloadEnsImage(ensNames[0], 0);
    for (let i = 1; i <= 2; i++) {
      await downloadEnsImage(ensNames[i], 1000);
    }
    for (let i = 3; i <= 1000; i++) {
      await downloadEnsImage(ensNames[i], 30000);
    }
  };

  const downloadEnsImage = async (ensName, timeDelay) => {
    let resolve = function (ensName) {
      ensImages[ensName] = getEnsImageUri(ensName);
    };
    let reject = function (ensName) {
      ensImages[ensName] = "";
    };

    const img = new Image();
    img.onload = () => {
      resolve(ensName);
    };
    img.onerror = () => {
      reject(ensName);
    };
    img.src = getEnsImageUri(ensName);

    await new Promise((r) => setTimeout(r, timeDelay));
  };

  const getEnsMetadata = async (ensName) => {
    const urlPromise = ensContract.getTextRecord("url", getNameHash(ensName));
    const twitterPromise = ensContract.getTextRecord(
      "com.twitter",
      getNameHash(ensName)
    );
    const githubPromise = ensContract.getTextRecord(
      "com.github",
      getNameHash(ensName)
    );

    const results = await Promise.all([
      urlPromise,
      twitterPromise,
      githubPromise,
    ]);

    const ensMetadata = {
      url: results[0] ? textRecordToUrl(results[0], "uri") : "",
      twitter: results[1] ? textRecordToUrl(results[1], "twitter") : "",
      github: results[2] ? textRecordToUrl(results[2], "github") : "",
    };
    setCurrentEnsMetadata(ensMetadata);
  };

  const getEnsImageUri = (ensName) => {
    return `https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/${getLabelHash(
      ensName
    )}/image`;
  };

  const getEnsDetailsUri = (ensName) => {
    return `https://app.ens.domains/name/${ensName}/details`;
  };

  const getOpenSeaUri = (ensName) => {
    const tokenId = hexToDec(getLabelHash(ensName, true));
    return `https://opensea.io/assets/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/${tokenId}`;
  };

  const getNameHash = (ensName) => {
    return namehash.hash(ensName);
  };

  const getLabelHash = (ensName, omitPrefix) => {
    const label = ensName.replace(".eth", "");

    const hasher = new Keccak(256);
    hasher.update(label);

    return (!omitPrefix ? "0x" : "") + hasher.digest("hex");
  };

  const getEnsName = (minutesToAdd) => {
    let now = new Date();
    if (minutesToAdd) {
      now = new Date(now.getTime() + minutesToAdd * 60000);
    }

    const hour =
      now.getHours() < 10 ? `0${now.getHours()}` : now.getHours().toString();
    const minute =
      now.getMinutes() < 10
        ? `0${now.getMinutes()}`
        : now.getMinutes().toString();
    return hour + "h" + minute + ".eth";
  };

  const getSeconds = () => {
    const now = new Date();
    const seconds =
      now.getSeconds() < 10
        ? `0${now.getSeconds()}`
        : now.getSeconds().toString();
    return seconds;
  };

  const isEnsImageLoading = () => {
    return !currentEnsImage;
  };

  const renderLoadingRipple = () => {
    return (
      <div className="lds-grid-container">
        <div className="lds-grid" style={{ margin: "auto" }}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  };

  const renderCardContent = () => {
    return (
      <div className="card-content">
        <img src={currentEnsImage} className="card-image" alt="ens avatar" />
        <div className="card-counter">
          <code>{seconds}</code>
        </div>
      </div>
    );
  };

  const renderIcon = (icon, uri, tooltip, style) => {
    return (
      <Tooltip title={tooltip} placement="top">
        <ButtonBase
          sx={{
            marginRight: 1,
            marginLeft: 1,
          }}
        >
          <a href={uri} target="_blank" rel="noreferrer">
            <img
              src={icon}
              className="icon-size"
              alt={tooltip + " icon"}
              style={!style ? {} : style}
            />
          </a>
        </ButtonBase>
      </Tooltip>
    );
  };

  const websiteIconStyle = {
    backgroundColor: "white",
    borderRadius: "50%",
  };
  const ensIconStyle = {
    borderRadius: "50%",
  };

  const hasEnsMetadata = () => {
    return (
      currentEnsMetadata.url ||
      currentEnsMetadata.twitter ||
      currentEnsMetadata.github
    );
  };

  const renderIcons = () => {
    return (
      <>
        {currentEnsMetadata.url ? (
          renderIcon(
            WebsiteIcon,
            currentEnsMetadata.url,
            "Website",
            websiteIconStyle
          )
        ) : (
          <></>
        )}
        {currentEnsMetadata.twitter ? (
          renderIcon(TwitterIcon, currentEnsMetadata.twitter, "Twitter")
        ) : (
          <></>
        )}
        {currentEnsMetadata.github ? (
          renderIcon(GithubIcon, currentEnsMetadata.github, "Github")
        ) : (
          <></>
        )}
        {!hasEnsMetadata() ? (
          renderIcon(OpenSeaIcon, getOpenSeaUri(getEnsName()), "OpenSea")
        ) : (
          <></>
        )}
        {!hasEnsMetadata() ? (
          renderIcon(
            EnsIcon,
            getEnsDetailsUri(getEnsName()),
            "ENS",
            ensIconStyle
          )
        ) : (
          <></>
        )}
      </>
    );
  };

  return (
    <div className="App">
      <div className="App-header container">
        <div className="col" style={{ display: "none" }}>
          <div className="row"></div>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://icons8.com/icon/63807/website"
          >
            Website
          </a>
          icon by
          <a target="_blank" rel="noreferrer" href="https://icons8.com">
            Icons8
          </a>
        </div>
      </div>
      <div className="App-body container align-self-center">
        <div className="col">
          <div className="row card-row">
            <Card raised={true} className="card card-size">
              {isEnsImageLoading()
                ? renderLoadingRipple()
                : renderCardContent()}
              <CardActions sx={{ marginBottom: 1, marginTop: 1 }}>
                <div style={{ margin: "auto" }}>{renderIcons()}</div>
              </CardActions>
            </Card>
          </div>
          <div className="row mt-4">
            <h4>24H Club</h4>
          </div>
        </div>
      </div>
      <div className="App-footer container">
        <div className="row">
          <div className="col">
            {renderIcon(GemXyzIcon, gemxyzLink, "Gem.xyz", {
              borderRadius: "50%",
              boxShadow: "0 1px 15px rgba(0, 0, 0, 0.225)",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
