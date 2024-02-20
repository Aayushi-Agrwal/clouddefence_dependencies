"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

async function getUserRepositories(username: string, accessToken: string) {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error accessing GitHub API:", error.response.data);
    throw error;
  }
}
interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
}

export default function Home() {
  const [rerender, setRerender] = useState(false);
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repository[]>([]); // Specify Repository[] type
  // const [followers, setFollowers] = useState<Repository[]>([]); // Specify Repository[] type
  const [error, setError] = useState<string | null>(null);
  const [showRepo, setShowRepo] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState("");
  const clientId = "b5d1d0f74e1b8428438b";

  function loginWithGithub() {
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" + clientId
    );
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setAccessToken("");
    window.location.reload();
  }

  async function getAccessToken(codeParam) {
    await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);

        if (data.access_token) {
          localStorage.setItem("accessToken", data.access_token);
          setAccessToken(data.access_token);
          setRerender(!rerender);
        }
      });
  }

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);

    if (codeParam && localStorage.getItem("accessToken") === null) {
      getAccessToken(codeParam);
    }
  }, []);

  const handleSearch = () => {
    getUserRepositories(username, localStorage.getItem("accessToken"))
      .then((data: Repository[]) => {
        setRepos(data);
        setError(null);
      })
      .catch((error) => {
        setRepos([]);
        setError(error.message);
      });

    setShowRepo(true);
  };

  function truncate(str: string, no_words: number) {
    const words = str.split(" ");
    const truncatedWords = words.slice(0, no_words);
    const truncatedString = truncatedWords.join(" ");

    if (words.length > no_words) {
      return truncatedString + "...";
    } else {
      return truncatedString;
    }
  }

  const mapRepos = repos.map((repo) => {
    return (
      <Link
        href={`/repos/${username}/${repo.name}`}
        key={repo.id}
        className="border border-slate-300 rounded-md h-[7rem] p-4 cursor-default hover:bg-gray-900 transition-all"
      >
        <h2 className="text-xl text-blue-300">{repo.name}</h2>
        {repo.description ? (
          <p className="text-sm pt-2">{truncate(repo.description, 20)}</p>
        ) : (
          <p className="text-sm pt-2">No description</p>
        )}
      </Link>
    );
  });
  return (
    <main className="flex flex-col items-center justify-between w-full">
      {accessToken == "" ? (
        <div className="absolute z-20 flex flex-col items-center justify-between h-full w-full">
          <div className="absolute top-0 right-0 m-4">
            <button
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
              onClick={logout}
            >
              Logout
            </button>
          </div>
          <div className="w-1/2 flex flex-col items-center justify-between rounded-lg h-1/3 m-12 z-20">
            <h1 className="text-lg font-semibold">
              Simplifying github account searches
            </h1>
            <p className="text-sm text-center w-5/6">
              Easier to discover profiles, repositories swiftly. Navigate the
              GitHub landscape effortlessly with our intuitive and efficient
              search tool.
            </p>
            <div className="w-full shadow-xl flex items-center justify-center gap-4 rounded-sm h-24">
              <input
                type="text"
                placeholder="GitHub username"
                className="border border-slate-100 rounded-md shadow-md w-2/3 py-2 px-2 h-12 placeholder:px-2 text-slate-800"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button
                className="bg-[#9EDDFF] w-1/6 h-12 duration-300 hover:scale-110 text-slate-800 rounded-lg"
                onClick={handleSearch}
                type="submit"
              >
                Search
              </button>
            </div>
            {error && <p>{error}</p>}
          </div>

          {showRepo && (
            <div className="w-5/6 grid grid-cols-2 grid-flow-row gap-12">
              {mapRepos}
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
            onClick={loginWithGithub}
          >
            Login
          </button>
        </>
      )}
    </main>
  );
}
