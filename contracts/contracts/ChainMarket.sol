// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
 
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChainMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _listingIds;
    
    struct Listing {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        string metadataUri;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => uint256)) public tokenToListingId;
    
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 price,
        string metadataUri
    );
    
    event Purchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );
    
    event Cancelled(uint256 indexed listingId);

    function listItem(
        address tokenContract,
        uint256 tokenId,
        uint256 price,
        string memory metadataUri
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(tokenContract).ownerOf(tokenId) == msg.sender,
            "Caller must own the token"
        );
        require(
            IERC721(tokenContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(tokenContract).getApproved(tokenId) == address(this),
            "Contract must be approved to transfer token"
        );

        _listingIds.increment();
        uint256 listingId = _listingIds.current();
        
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenContract: tokenContract,
            tokenId: tokenId,
            price: price,
            active: true,
            metadataUri: metadataUri
        });
        
        tokenToListingId[tokenContract][tokenId] = listingId;
        
        IERC721(tokenContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit Listed(listingId, msg.sender, tokenContract, tokenId, price, metadataUri);
    }

    function purchaseItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(msg.value == listing.price, "Incorrect ETH amount");
        require(msg.sender != listing.seller, "Seller cannot buy own listing");

        listing.active = false;
        
        IERC721(listing.tokenContract).transferFrom(address(this), msg.sender, listing.tokenId);
        payable(listing.seller).transfer(listing.price);
        
        emit Purchased(listingId, msg.sender, listing.price);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(msg.sender == listing.seller, "Only seller can cancel");

        listing.active = false;
        
        IERC721(listing.tokenContract).transferFrom(address(this), listing.seller, listing.tokenId);
        
        emit Cancelled(listingId);
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }
        
        return activeListings;
    }
}
