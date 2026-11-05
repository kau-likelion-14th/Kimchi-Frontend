import React, { useEffect, useRef, useState } from "react";
import api from "../../Api";
import config from "../../config";
import FriendList from "./FriendList";
import FriendSearch from "./FriendSearch";
import FriendUnfollowModal from "./FriendUnfollowModal";
import { toFriendModel } from "./friendModel";
import "../../styles/FriendPage.css";

function FriendPage() {
  const [followList, setFollowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const removingRef = useRef(false);

  const followingRef = useRef(false);
  const [followingId, setFollowingId] = useState(null);
  const [followError, setFollowError] = useState("");
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  // 팔로잉 목록 조회 (GET /api/follow/followings, 배열은 data.result)
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await api.get(config.FOLLOW.FOLLOWINGS);
        if (data?.isSuccess === false || !Array.isArray(data?.result)) {
          throw new Error("팔로잉 목록 응답을 확인해 주세요.");
        }
        if (active) setFollowList(data.result.map(toFriendModel));
      } catch {
        if (active) setLoadError("팔로잉 목록을 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // 팔로우 (POST /api/follow)
  const handleFollow = async (user) => {
    if (
      !user ||
      loading ||
      loadError ||
      isModalOpen ||
      followingRef.current ||
      removingRef.current ||
      followList.some((friend) => friend.id === user.id)
    ) {
      return;
    }

    followingRef.current = true;
    setFollowingId(user.id);
    setFollowError("");

    try {
      const response = await api.post(config.FOLLOW.CREATE, {
        toUserId: user.userId,
      });

      const data = response.data;

      if (
        data?.isSuccess === false ||
        data?.result?.userId == null ||
        String(data.result.userId) !== user.id
      ) {
        throw new Error("팔로우 응답을 확인해 주세요.");
      }

      const newFriend = toFriendModel(data.result);

      setFollowList((prev) =>
        prev.some((friend) => friend.id === newFriend.id)
          ? prev
          : [...prev, newFriend]
      );

      // 팔로우 가능한 검색 결과도 서버에서 다시 확인합니다.
      setSearchRefreshKey((value) => value + 1);
    } catch {
      setFollowError("팔로우에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      followingRef.current = false;
      setFollowingId(null);
    }
  };

  const handleClickRemove = (friend) => {
    if (removingRef.current || followingRef.current) return;
    setSelectedFriend(friend);
    setIsModalOpen(true);
  };

  // 언팔로우 (DELETE /api/follow, 본문은 data 안에)
  const handleConfirmRemove = async () => {
    if (!selectedFriend || removingRef.current) return;

    removingRef.current = true;
    setIsRemoving(true);

    try {
      const { data } = await api.delete(config.FOLLOW.DELETE, {
        data: { toUserId: selectedFriend.userId },
      });
      if (data?.isSuccess === false) {
        throw new Error("언팔로우 응답을 확인해 주세요.");
      }

      setFollowList((prev) =>
        prev.filter((friend) => friend.id !== selectedFriend.id)
      );
      setIsModalOpen(false);
      setSelectedFriend(null);
      setSearchRefreshKey((value) => value + 1);
    } catch {
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      removingRef.current = false;
      setIsRemoving(false);
    }
  };

  const handleCloseModal = () => {
    if (removingRef.current) return;
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  return (
    <div className="friend-page">
      <div className="friend-page__inner">
        <div className="friend-page__grid">
          <FriendList
            title="팔로우 목록"
            friends={followList}
            onClickRemove={handleClickRemove}
            emptyText={
              loading
                ? "불러오는 중..."
                : loadError || "팔로우하는 친구가 없습니다."
            }
          />

          <FriendSearch
            onFollow={handleFollow}
            followingList={followList}
            followingId={followingId}
            followError={followError}
            followDisabled={
              loading || Boolean(loadError) || isModalOpen || isRemoving
            }
            refreshKey={searchRefreshKey}
          />
        </div>
      </div>

      <FriendUnfollowModal
        isOpen={isModalOpen}
        friend={selectedFriend}
        onConfirm={handleConfirmRemove}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default FriendPage;
