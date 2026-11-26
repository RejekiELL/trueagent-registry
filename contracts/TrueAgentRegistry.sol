// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal read interface for the SPACE ID Agent ID registry (ERC-721).
interface IAgentID {
    function balanceOf(address owner) external view returns (uint256);
}

/// @title TrueAgentRegistry — Proof of Self-Operation for Agent ID holders
/// @notice The Agent ID rental problem: Agent IDs are rented out for a few
///         dollars so third parties can farm Agent-ID-gated launches with
///         someone else's identity. Holding an Agent ID proves an identity
///         exists — it does NOT prove who operates it.
///
///         TrueAgent is a public, voluntary registry where an Agent ID holder
///         pledges on-chain that they operate their own Agent ID (not rented,
///         not lent), and other holders can endorse operators they trust.
///         Any launchpad, gated mint, or dApp can query `isSelfOperated()`
///         before allocating a per-Agent-ID quota, so rented IDs that never
///         pledge carry no trust signal.
///
/// @dev Permissions: this contract has NO owner and NO admin functions.
///      Nobody can mint, pause, freeze, tax, or withdraw anything — there is
///      nothing to withdraw; the contract never receives funds (no payable
///      functions). A pledge can only be created or revoked by the holder
///      themself, and an endorsement can only be given by another holder.
contract TrueAgentRegistry {
    /// @notice The SPACE ID Agent ID contract on BNB Chain (chainId 56).
    IAgentID public immutable agentIdRegistry;

    struct Pledge {
        bool active;
        uint64 pledgedAt;
        uint32 endorsementsReceived;
    }

    mapping(address => Pledge) private _pledges;
    /// endorser => operator => already endorsed
    mapping(address => mapping(address => bool)) private _endorsed;

    /// @notice Number of currently active self-operation pledges.
    uint256 public totalPledged;
    /// @notice Total endorsements ever given.
    uint256 public totalEndorsements;

    event Pledged(address indexed operator, uint256 pledgedAt);
    event PledgeRevoked(address indexed operator);
    event Endorsed(address indexed endorser, address indexed operator);

    error NotAgentIDHolder();
    error AlreadyPledged();
    error NotPledged();
    error CannotEndorseSelf();
    error AlreadyEndorsed();

    constructor(address agentIdRegistry_) {
        require(agentIdRegistry_ != address(0), "zero address");
        agentIdRegistry = IAgentID(agentIdRegistry_);
    }

    /// @notice True if `account` currently holds at least one Agent ID.
    function isAgentIDHolder(address account) public view returns (bool) {
        return agentIdRegistry.balanceOf(account) > 0;
    }

    /// @notice Pledge that you operate your own Agent ID yourself.
    ///         One active pledge per holder. Revocable at any time.
    function pledgeSelfOperated() external {
        if (!isAgentIDHolder(msg.sender)) revert NotAgentIDHolder();
        Pledge storage p = _pledges[msg.sender];
        if (p.active) revert AlreadyPledged();
        p.active = true;
        p.pledgedAt = uint64(block.timestamp);
        totalPledged += 1;
        emit Pledged(msg.sender, block.timestamp);
    }

    /// @notice Revoke your pledge (e.g. you stop operating the ID yourself).
    ///         Transparency cuts both ways: revoking is public and permanent
    ///         in the event history.
    function revokePledge() external {
        Pledge storage p = _pledges[msg.sender];
        if (!p.active) revert NotPledged();
        p.active = false;
        totalPledged -= 1;
        emit PledgeRevoked(msg.sender);
    }

    /// @notice Endorse another pledged operator you trust. Holders only,
    ///         never yourself, once per (endorser, operator) pair.
    function endorse(address operator) external {
        if (!isAgentIDHolder(msg.sender)) revert NotAgentIDHolder();
        if (operator == msg.sender) revert CannotEndorseSelf();
        Pledge storage p = _pledges[operator];
        if (!p.active) revert NotPledged();
        if (_endorsed[msg.sender][operator]) revert AlreadyEndorsed();
        _endorsed[msg.sender][operator] = true;
        p.endorsementsReceived += 1;
        totalEndorsements += 1;
        emit Endorsed(msg.sender, operator);
    }

    /// @notice THE integration point for other projects: should this address
    ///         be trusted as a self-operated Agent ID?
    ///         True only while the pledge is active AND the address still
    ///         holds its Agent ID.
    function isSelfOperated(address account) external view returns (bool) {
        return _pledges[account].active && isAgentIDHolder(account);
    }

    /// @notice Full pledge record for an address.
    function pledgeOf(address account)
        external
        view
        returns (bool active, uint64 pledgedAt, uint32 endorsementsReceived)
    {
        Pledge storage p = _pledges[account];
        return (p.active, p.pledgedAt, p.endorsementsReceived);
    }

    /// @notice Whether `endorser` has endorsed `operator`.
    function hasEndorsed(address endorser, address operator) external view returns (bool) {
        return _endorsed[endorser][operator];
    }
}
