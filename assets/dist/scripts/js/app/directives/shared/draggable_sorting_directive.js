(function () {
    app.directive('sortable', ['$ionicGesture', '$ionicScrollDelegate','$timeout', function ($ionicGesture, $ionicScrollDelegate,$timeout) {
        return {
            restrict: 'A',
            //scope: {
            //    draggable: '@',
            //    sorted: '&'
            //},
            link: function (scope, element, attrs) {

                var settings = {
                    draggable: attrs.draggable ? attrs.draggable : '.card',
                    duration: 200
                };

                var dragging = null, placeholder = null, offsetY = 0, marginTop = 0;
                var cardSet, allCardSet, initialIndex, currentIndex, animating = false;
                var closetIndex,initialClosestIndex;

                var placeholderHeight;
                var scrollInterval;

                var createPlaceholder = function createPlaceholder(height) {
                    // Use marginTop to compensate for extra margin when animating the placeholder
                    return $('<div></div>')
                        .css({
                            height: height + 'px',
                            marginTop: (currentIndex > 0 ? -marginTop : -1) + 'px'
                        })
                        .addClass('placeholder');
                };

                function getClosestIndex(newIndex,newTop,cardSet,allCardSet){
                    var closetIndex;
                    var positionToInsert='';
                    var relativeCard;
                    var nextCard=cardSet[newIndex];
                    if (newIndex < cardSet.length) {
                        if(newIndex>0){
                            var previousCard=cardSet[newIndex-1];
                            var lastBottom=$(previousCard).position().top+$(previousCard).height()+1;


                            var nextTop=$(nextCard).position().top+1;

                            if(newTop-lastBottom<nextTop-newTop){
                                positionToInsert='insertAfter';
                                relativeCard=previousCard;
                                closetIndex=allCardSet.index(relativeCard);
                                //placeholder.insertAfter(previousCard);


                                //if(initialIndex<newIndex){
                                //    closetIndex=newIndex;
                                //}
                                //else{
                                //    closetIndex=newIndex-1;
                                //}
                            }
                            else{
                                positionToInsert='insertBefore';
                                relativeCard=nextCard;
                                closetIndex=allCardSet.index(relativeCard);
                                //placeholder.insertBefore(cardSet.eq(newIndex));
                                //
                                //if(initialIndex<newIndex){
                                //    closetIndex=newIndex+1;
                                //}
                                //else{
                                //    closetIndex=newIndex;
                                //}

                            }

                        }
                        else{
                            positionToInsert='insertBefore';
                            relativeCard=nextCard;
                            closetIndex=allCardSet.index(nextCard);
                            //console.log('new Index '+newIndex+'; closest Index: '+closetIndex);;

                            //placeholder.insertBefore(cardSet.eq(newIndex));
                            //newIndex=0;
                            //closetIndex=newIndex;

                        }

                    } else {
                        positionToInsert='insertAfter';
                        nextCard=cardSet[newIndex-1];
                        relativeCard=nextCard;
                        closetIndex=allCardSet.index(nextCard);

                        //console.log('index exceeded  nextIndex: '+newIndex+';; closest Index: '+closetIndex);
                        //console.log(nextCard);

                        //closetIndex=cardSet.length;
                        //placeholder.insertAfter(cardSet.eq(cardSet.length - 1));
                    }

                    return {closestIndex:closetIndex,relativeCard:relativeCard,positionToInsert:positionToInsert};

                }

                var touchHold = function touchHold(e) {
                    //console.clear();
                    // Get the element we're about to start dragging
                    dragging = angular.element(e.target).closest(settings.draggable);

                    if (!dragging.length) dragging = null;

                    if (dragging) {


                        // Get the initial index
                        allCardSet=element.find(settings.draggable);
                        initialIndex = currentIndex = allCardSet.index(dragging);


                        var position = dragging.position();

                        // Get relative position of touch
                        var clientY = e.gesture.touches[0].clientY;
                        offsetY = clientY - position.top - element.offset().top;

                        //var touchY = e.touches ? e.touches[0].clientY : e.clientY;

                        // Switch to Absolute position at same location
                        dragging.css({
                            position: 'absolute',
                            zIndex: 1000,
                            left: position.left + 'px',
                            top: position.top + 'px',
                            width: dragging.outerWidth() + 'px'
                        })
                            .addClass('dragging');

                        // Get the set of cards that were re-ordering with
                        cardSet = allCardSet.not('.dragging');

                        var newTop = clientY - offsetY - element.offset().top;
                        var moveInfo=getClosestIndex(initialIndex,newTop,cardSet,allCardSet);

                        closetIndex=moveInfo.closestIndex
                        initialClosestIndex=closetIndex;
                        //console.log(cardSet);

                        // We need to know the margin size so we can compensate for having two
                        // margins where we previously had one (due to the placeholder being there)
                        marginTop = parseInt(dragging.css('marginTop')) + 1;

                        // Replace with placeholder (add the margin for when placeholder is full size)
                        placeholderHeight = dragging.outerHeight() + marginTop;
                        placeholder = createPlaceholder(placeholderHeight);
                        placeholder.insertAfter(dragging);

                        // Interval to handle auto-scrolling window when at top or bottom
                        initAutoScroll();
                        scrollInterval = setInterval(autoScroll, 20);
                        //$ionicScrollDelegate.getScrollView().isNative=true;
                    }
                };
                var holdGesture = $ionicGesture.on('hold', touchHold, element);
                var moveLog='';
                var touchMove = function touchMove(e) {

                    if (dragging) {
                        //closetIndex=-1;

                        e.stopPropagation();
                        touchY = e.touches ? e.touches[0].clientY : e.clientY;
                        var newTop = touchY - offsetY - element.offset().top;

                        // Reposition the dragged element
                        dragging.css('top', newTop + 'px');

                        // Check for position in the list
                        var newIndex = 0;
                        var currentTop,lastBottom;
                        cardSet.each(function (i) {
                            var thisTop=$(this).position().top;


//&& (lastBottom<0||(newTop-lastBottom>thisTop-newTop))
                            if (newTop > thisTop ) {
                                newIndex = i + 1;
                                currentTop=thisTop;
                                if(i>0){

                                    var previousCard=cardSet[i-1];
                                    lastBottom=$(previousCard).position().top+$(previousCard).height();
                                }

                            }
                        });

                        var log='drag from : '+initialIndex+'; to : '+newIndex+'; lastIndex: '+currentIndex;
                        //closetIndex=getClosestIndex(newIndex,newTop,cardSet,allCardSet).closestIndex;
                        //console.log(log+'; closest : '+closetIndex);



                        if (!animating && newIndex !== currentIndex) {
                            currentIndex = newIndex;
                            //console.log(newIndex);

                            var oldPlaceholder = placeholder;
                            // Animate in a new placeholder
                            placeholder = createPlaceholder(1);
                            //console.log("new Index :"+newIndex);
                            //console.log('currentTop : '+currentTop+';; lastBottom : '+lastBottom);
                            //
                            ////console.log(cardSet.eq(newIndex));
                            //console.log($(cardSet.eq(newIndex)).find('.task-name').text());
                            //
                            //
                            // Put it in the right place
                            var moveInfo=getClosestIndex(newIndex,newTop,cardSet,allCardSet);
                            if(moveInfo){
                                placeholder[moveInfo.positionToInsert](moveInfo.relativeCard);
                                closetIndex=moveInfo.closestIndex;
                            }

                            //
                            //if (newIndex < cardSet.length) {
                            //    if(newIndex>0){
                            //        var previousCard=cardSet[newIndex-1];
                            //        var lastBottom=$(previousCard).position().top+$(previousCard).height()+1;
                            //
                            //        var nextCard=cardSet[newIndex];
                            //        var nextTop=$(nextCard).position().top+1;
                            //
                            //        if(newTop-lastBottom<nextTop-newTop){
                            //            placeholder.insertAfter(cardSet.eq(newIndex-1));
                            //            if(initialIndex<newIndex){
                            //                closetIndex=newIndex;
                            //            }
                            //            else{
                            //                closetIndex=newIndex-1;
                            //            }
                            //        }
                            //        else{
                            //            placeholder.insertBefore(cardSet.eq(newIndex));
                            //            if(initialIndex<newIndex){
                            //                closetIndex=newIndex+1;
                            //            }
                            //            else{
                            //                closetIndex=newIndex;
                            //            }
                            //
                            //        }
                            //
                            //    }
                            //    else{
                            //        placeholder.insertBefore(cardSet.eq(newIndex));
                            //        newIndex=0;
                            //        closetIndex=newIndex;
                            //
                            //        //closetIndex=newIndex;
                            //    }
                            //
                            //} else {
                            //    closetIndex=cardSet.length;
                            //    placeholder.insertAfter(cardSet.eq(cardSet.length - 1));
                            //}




                            // Animate the new placeholder to full height
                            animating = true;
                            setTimeout(function () {
                                if(!placeholder){
                                    return;
                                }
                                placeholder.css('height', placeholderHeight + 'px');
                                // Animate out the old placeholder
                                oldPlaceholder.css('height', 1);

                                setTimeout(function () {

                                    oldPlaceholder.remove();
                                    animating = false;

                                }, settings.duration);
                            }, 50);
                        }
                        //console.log(log+'; closest : '+closetIndex+';; initialClosestIndex: '+initialClosestIndex);
                    }
                };

                var touchMoveGesture = $ionicGesture.on('touchmove', touchMove, element);
                var mouseMoveGesture = $ionicGesture.on('mousemove', touchMove, element);

                var touchRelease = function touchRelease(e) {
                    if (dragging) {
                        // Set element back to normal




                        function cleanUp(replace){
                            //$timeout(function(){
                            //dragging.insertAfter(placeholder);
                            dragging.css({
                                position: '',
                                zIndex: '',
                                left: '',
                                top: '',
                                width: ''
                            }).removeClass('dragging');
                            if(replace){
                                placeholder.replaceWith(dragging);
                            }
                            else{
                                placeholder.remove();
                            }

                                // Remove placeholder

                                placeholder = null;
                                dragging = null;
                           // },2000);

                        }

                        //cleanUp();
                        //$ionicScrollDelegate.freezeAllScrolls(false);

                        clearInterval(scrollInterval);
                        //console.log('drop==from : '+initialIndex+'; to : '+currentIndex+'; closest : '+closetIndex+';; initialClosestIndex: '+initialClosestIndex);


                        if ((initialIndex !== currentIndex|| initialClosestIndex!=closetIndex) && attrs.sorted) {
                            // Call the callback with the instruction to re-order
                            scope.$fromIndex = initialIndex;
                            scope.$toIndex = currentIndex;
                            scope.$closestIndex=closetIndex;
                            //console.log('initialIndex '+initialIndex+';;currentIndex='+currentIndex);
                            //scope.$apply(scope.sorted);
                            scope.$apply(function(){
                                var sortedFn=scope[attrs.sorted];
                                var res=sortedFn(initialIndex,currentIndex,closetIndex);
                                if(res && res.then){
                                    res.then(function(){
                                       cleanUp(true);
                                    },function(){
                                        cleanUp();
                                    });
                                }
                                else{
                                    cleanUp();
                                }
                            });

                        }
                        else{
                            cleanUp();
                        }

                        //$ionicScrollDelegate.getScrollView().isNative=true;

                    }
                };
                var releaseGesture = $ionicGesture.on('release', touchRelease, element);

                scope.$on('$destroy', function () {
                    $ionicGesture.off(holdGesture, 'hold', touchHold);
                    $ionicGesture.off(touchMoveGesture, 'touchmove', touchMove);
                    $ionicGesture.off(mouseMoveGesture, 'mousemove', touchMove);
                    $ionicGesture.off(releaseGesture, 'release', touchRelease);
                    if(scrollInterval){
                        clearInterval(scrollInterval);
                    }
                });

                var touchY, scrollHeight, containerTop, maxScroll;
                var scrollBorder = 80, scrollSpeed = 0.2;
                // Setup the autoscroll based on the current scroll window size
                var parentScrollDelegate=$ionicScrollDelegate;
                var initAutoScroll = function initAutoScroll() {
                    touchY = -1;
                    var scrollArea = element.closest('.scroll');
                    var container = scrollArea.parent();
                    scrollHeight = container.height();
                    containerTop = container.position().top;
                    maxScroll = scrollArea.height() - scrollHeight;
                    //console.log('scrollArea');
                    //console.log(scrollArea);
                    //console.log('container');
                    //console.log(container);
                    if($(container).attr('delegate-handle'))
                        parentScrollDelegate=$ionicScrollDelegate.$getByHandle($(container).attr('delegate-handle'));
                };

                // Autoscroll function to scroll window up and down when
                // the touch point is close to the top or bottom
                var oldScroll,waitingForScroll=0;

                var autoScroll = function autoScroll() {
                    //$ionicScrollDelegate.freezeAllScrolls(true);
                    var scrollChange = 0;
                    if (touchY >= 0 && touchY < containerTop + scrollBorder) {
                        // Should scroll up
                        scrollChange = touchY - (containerTop + scrollBorder);
                    } else if (touchY >= 0 && touchY > scrollHeight - scrollBorder) {
                        // Should scroll down
                        scrollChange = touchY - (scrollHeight - scrollBorder);
                    }

                    if (scrollChange !== 0) {

                        // get the updated scroll position
                        var newScroll = parentScrollDelegate.getScrollPosition().top + scrollSpeed * scrollChange;
                        // Apply scroll limits
                        if (newScroll < 0)
                            newScroll = 0;
                        else if (newScroll > maxScroll)
                            newScroll = maxScroll;

                        //console.log('top:  '+ parentScrollDelegate.getScrollPosition().top + ';;; scrollChange:  '+scrollChange+';;;; newScroll: '+newScroll +';;; maxScroll:  '+maxScroll);

                        // Set the scroll position
                        parentScrollDelegate.scrollTo(0, newScroll, false);
                    }

                    //var scrollChange = 0;
                    //if (touchY >= 0 && touchY < containerTop + scrollBorder) {
                    //    // Should scroll up
                    //    scrollChange = touchY - (containerTop + scrollBorder);
                    //} else if (touchY >= 0 && touchY > scrollHeight - scrollBorder) {
                    //    // Should scroll down
                    //    scrollChange = touchY - (scrollHeight - scrollBorder);
                    //}
                    //
                    //
                    //if (scrollChange !== 0) {
                    //    // get the updated scroll position
                    //    var newScroll = $ionicScrollDelegate.getScrollPosition().top + scrollSpeed * scrollChange;
                    //    if(newScroll==oldScroll && waitingForScroll>10){
                    //        waitingForScroll=0;
                    //        newScroll=newScroll+scrollSpeed * scrollChange;
                    //    }
                    //    // Apply scroll limits
                    //    if (newScroll < 0)
                    //        newScroll = 0;
                    //    else if (newScroll > maxScroll)
                    //        newScroll = maxScroll;
                    //
                    //    // Set the scroll position
                    //    console.log('scrollChange: '+scrollChange+'; touchY: '+
                    //    touchY+'; containerTop: '+containerTop+'; scrollBorder: '+scrollBorder
                    //    +'; scrollHeight: '+scrollHeight+'; newScroll: '+newScroll+'; maxScroll: '+maxScroll
                    //    +'; waitingForScroll: '+waitingForScroll);
                    //    oldScroll=newScroll;
                    //    waitingForScroll++;
                    //    $ionicScrollDelegate.scrollTo(0, newScroll, false);
                    //}
                };

            }
        };
        //return {
        //    restrict: 'A',
        //    scope: {
        //        draggable: '@',
        //        sorted: '&'
        //
        //    },
        //    link: function (scope, element, attrs) {
        //
        //
        //
        //        var settings = {
        //            draggable: scope.draggable ? scope.draggable : '.tdz-draggable',
        //            duration: 200
        //        };
        //
        //        var dragging = null, placeholder = null, offsetY = 0, marginTop = 0;
        //        var cardSet, initialIndex, currentIndex, animating = false;
        //        var theParent=$(element).parents(attrs.dragParentSelector);
        //        var theElement=$(element);
        //
        //
        //        var placeholderHeight;
        //        var scrollInterval;
        //
        //        var createPlaceholder = function createPlaceholder(height) {
        //            // Use marginTop to compensate for extra margin when animating the placeholder
        //            return $('<div></div>')
        //                .css({
        //                    height: height + 'px',
        //                    marginTop: (currentIndex > 0 ? -marginTop : -1) + 'px'
        //                })
        //                .addClass('placeholder');
        //        };
        //
        //        var touchHold = function touchHold(e) {
        //            console.clear();
        //            // Get the element we're about to start dragging
        //            dragging = angular.element(e.target).closest(settings.draggable);
        //
        //            if (!dragging.length) dragging = null;
        //            if (dragging) {
        //                // Get the initial index
        //                initialIndex = currentIndex =theParent.children('.draggable-item').index(theElement);// dragging.index(settings.draggable);
        //                console.log('initial index : '+initialIndex);
        //                var position = dragging.position();
        //
        //                // Get relative position of touch
        //                var clientY = e.gesture.touches[0].clientY;
        //                offsetY = clientY - position.top - element.offset().top;
        //
        //                // Switch to Absolute position at same location
        //                dragging.css({
        //                    position: 'absolute',
        //                    zIndex: 1000,
        //                    left: position.left + 'px',
        //                    top: position.top + 'px',
        //                    width: dragging.outerWidth() + 'px',
        //                    background: '#e5eff7'
        //                })
        //                    .addClass('dragging');
        //
        //                // Get the set of cards that were re-ordering with
        //
        //                //cardSet = element.find(settings.draggable + ':not(.dragging)');
        //                cardSet = theParent.children('.draggable-item').not(theElement);
        //
        //                console.log('cardset length : '+cardSet.length);
        //                //console.log(cardSet);
        //                //cardSet = angular.element('.tdz-models .task-list ' +settings.draggable+':not(.dragging)');
        //
        //                // We need to know the margin size so we can compensate for having two
        //                // margins where we previously had one (due to the placeholder being there)
        //                marginTop = parseInt(dragging.css('marginTop')) + 1;
        //
        //                // Replace with placeholder (add the margin for when placeholder is full size)
        //                placeholderHeight = dragging.outerHeight() + marginTop;
        //                placeholder = createPlaceholder(placeholderHeight);
        //                placeholder.insertAfter(dragging);
        //
        //                // Interval to handle auto-scrolling window when at top or bottom
        //                initAutoScroll();
        //                scrollInterval = setInterval(autoScroll, 20);
        //            }
        //        };
        //        var holdGesture = $ionicGesture.on('hold', touchHold, element);
        //
        //        var touchMove = function touchMove(e) {
        //            //return;
        //            if (dragging) {
        //                e.stopPropagation();
        //                touchY = e.touches ? e.touches[0].clientY : e.clientY;
        //                var newTop = touchY - offsetY - element.offset().top;
        //
        //                // Reposition the dragged element
        //                dragging.css('top', newTop + 'px');
        //                //console.log('newTop : '+newTop);
        //                // Check for position in the list
        //                var newIndex = 0;
        //                angular.forEach(cardSet,function(ele,i){
        //                    if (newTop > $(ele).position().top) {
        //                        //console.log(cardSet);
        //                        //console.log(ele);
        //                        //console.log('cardset item top : '+$(ele).position().top);
        //                        newIndex = i + 1;
        //                    }
        //                });
        //                //cardSet.each(function (i,ele) {
        //                //
        //                //});
        //
        //                if (!animating && newIndex !== currentIndex) {
        //                    console.log('new index : '+newIndex);
        //                    currentIndex = newIndex;
        //
        //                    var oldPlaceholder = placeholder;
        //                    // Animate in a new placeholder
        //                    placeholder = createPlaceholder(1);
        //
        //                    // Put it in the right place
        //                    if (newIndex < cardSet.length) {
        //                        placeholder.insertBefore(cardSet.eq(newIndex));
        //                    } else {
        //                        placeholder.insertAfter(cardSet.eq(cardSet.length - 1));
        //                    }
        //
        //                    // Animate the new placeholder to full height
        //                    animating = true;
        //                    setTimeout(function () {
        //                        placeholder.css('height', placeholderHeight + 'px');
        //                        // Animate out the old placeholder
        //                        oldPlaceholder.css('height', 1);
        //
        //                        setTimeout(function () {
        //                            oldPlaceholder.remove();
        //                            animating = false;
        //                        }, settings.duration);
        //                    }, 50);
        //                }
        //            }
        //        };
        //
        //        var touchMoveGesture = $ionicGesture.on('touchmove', touchMove, element);
        //        var mouseMoveGesture = $ionicGesture.on('mousemove', touchMove, element);
        //
        //        var touchRelease = function touchRelease(e) {
        //            if (dragging) {
        //                e.stopPropagation();
        //                // Set element back to normal
        //                dragging.css({
        //                    position: '',
        //                    zIndex: '',
        //                    left: '',
        //                    top: '',
        //                    width: '',
        //                    background:''
        //                }).removeClass('dragging');
        //
        //                // Remove placeholder
        //                //placeholder.remove();
        //                //placeholder = null;
        //
        //                if (initialIndex !== currentIndex && scope.sorted) {
        //                    // Call the callback with the instruction to re-order
        //                    scope.$fromIndex = initialIndex;
        //                    scope.$toIndex = currentIndex;
        //                    placeholder.remove();
        //                    scope.$apply(scope.sorted);
        //                }
        //                dragging = null;
        //
        //                clearInterval(scrollInterval);
        //            }
        //        };
        //        var releaseGesture = $ionicGesture.on('release', touchRelease, element);
        //
        //        scope.$on('$destroy', function () {
        //            $ionicGesture.off(holdGesture, 'hold', touchHold);
        //            $ionicGesture.off(touchMoveGesture, 'touchmove', touchMove);
        //            $ionicGesture.off(mouseMoveGesture, 'mousemove', touchMove);
        //            $ionicGesture.off(releaseGesture, 'release', touchRelease);
        //        });
        //
        //        var touchY, scrollHeight, containerTop, maxScroll;
        //        var scrollBorder = 80, scrollSpeed = 0.2;
        //        // Setup the autoscroll based on the current scroll window size
        //        var scrollArea = element.closest('.scroll');
        //        var container = scrollArea.parent();
        //        var initAutoScroll = function initAutoScroll() {
        //            touchY = -1;
        //
        //            scrollHeight = container.height();
        //            containerTop = container.offset().top;
        //            maxScroll = scrollArea.height() - scrollHeight;
        //        };
        //
        //        // Autoscroll function to scroll window up and down when
        //        // the touch point is close to the top or bottom
        //        var autoScroll = function autoScroll() {
        //            //var scrollChange = 0;
        //            //var containerScrollPos=$ionicScrollDelegate.getScrollPosition();
        //            ////var visibleTop=
        //            //var visibleAreaHeight=getVisibleArea(container,window);
        //            //
        //            //if (touchY >= 0 && touchY > containerTop + containerScrollPos.top+visibleAreaHeight-scrollBorder) {
        //            //    // Should scroll up
        //            //    scrollChange = touchY - (containerTop +containerScrollPos.top+ visibleAreaHeight);
        //            //} else if (touchY >= 0 && touchY < containerTop+ containerScrollPos.top) {
        //            //    // Should scroll down
        //            //    scrollChange = touchY - (containerTop+ containerScrollPos.top);
        //            //}
        //            //console.log('touchY='+touchY+'; containerTop='+containerTop+'; containerScrollPos='+containerScrollPos.top
        //            //+'; visibleAreaHeight='+visibleAreaHeight+' ; scrollBorder: '+scrollBorder);
        //            //
        //            var scrollChange = 0;
        //            if (touchY >= 0 && touchY < containerTop + scrollBorder) {
        //                // Should scroll up
        //                scrollChange = touchY - (containerTop + scrollBorder);
        //            } else if (touchY >= 0 && touchY > scrollHeight - scrollBorder) {
        //                // Should scroll down
        //                scrollChange = touchY - (scrollHeight - scrollBorder);
        //            }
        //
        //            if (scrollChange !== 0) {
        //                var draggingPos=dragging.position();
        //                var draggingNewPos=angular.copy(draggingPos);
        //                // get the updated scroll position
        //                var newScroll = $ionicScrollDelegate.getScrollPosition().top + scrollSpeed * scrollChange;
        //                // Apply scroll limits
        //
        //                if (newScroll < 0) {
        //                    newScroll = 0;
        //                    draggingNewPos.top=0;
        //                }
        //                else if (newScroll > maxScroll) {
        //                    newScroll = maxScroll;
        //                    draggingNewPos.top=draggingNewPos.top+scrollSpeed * scrollChange;
        //                }
        //                // Set the scroll position
        //                $ionicScrollDelegate.scrollTo(0, newScroll, false);
        //                dragging.position(draggingNewPos.left,draggingNewPos.top);
        //            }
        //        };
        //
        //        function getVisibleArea(el,parent) {
        //            var $el = $(el),
        //                scrollTop = $(parent).scrollTop(),
        //                scrollBot = scrollTop + $(parent).height(),
        //                elTop = $el.offset().top,
        //                elBottom = elTop + $el.outerHeight(),
        //                visibleTop = elTop < scrollTop ? scrollTop : elTop,
        //                visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
        //            return visibleBottom - visibleTop;
        //        }
        //
        //    }
        //};
    }]);

}).call(this);